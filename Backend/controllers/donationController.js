// controllers/donationController.js
// Core business logic — the entire donate-to-claim flow.
// Month 2 tasks: POST /api/list-donation, GET /api/match-ngos, POST /api/claim

import Donation from '../models/Donation.js';
import NGO from '../models/NGO.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { uploadToCloudinary } from '../middleware/uploadMiddleware.js';
import { notifyNGOs } from './notificationController.js';

// POST /api/donations/list  (donor only)
// Saves donation to MongoDB. Triggers NGO matching and notifications.
export const listDonation = async (req, res) => {
  try {
    const {
      drugName, category, manufacturer, batchNumber, quantity, quantityUnit,
      expiryDate, storageCondition, originalSeal, noWaterDamage, sterilePackaging,
      description, pincode, lat, lng, gates,
    } = req.body;

    // If a photo was uploaded (multipart form), upload it to Cloudinary
    let photoUrl = null;
    if (req.file) {
      photoUrl = await uploadToCloudinary(req.file.buffer);
    }

    const coldChain = storageCondition === 'refrigerated';

    const donation = await Donation.create({
      donorId: req.user.id,
      drugName,
      category,
      manufacturer: manufacturer || null,
      batchNumber: batchNumber || null,
      quantity: Number(quantity),
      quantityUnit: quantityUnit || 'Units',
      expiryDate: new Date(expiryDate),
      coldChain,
      originalSeal: Boolean(originalSeal),
      noWaterDamage: Boolean(noWaterDamage),
      sterilePackaging: Boolean(sterilePackaging),
      description: description || null,
      photoUrl,
      pincode: pincode || null,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng) || 0, parseFloat(lat) || 0], // GeoJSON is [lng, lat]
      },
      status: 'available',
      gates: gates || [],
    });

    // Increment donor's total donations
    await User.findByIdAndUpdate(req.user.id, { $inc: { totalDonations: 1 } });

    // Write audit log
    await AuditLog.create({
      donationId: donation._id,
      action: 'listed',
      actorId: req.user.id,
      notes: `${drugName} (${quantity} ${quantityUnit || 'Units'}) listed.`,
    });

    // Fire-and-forget: find matching NGOs and notify them
    // We don't await this so the response is instant for the donor
    findAndNotifyNGOs(donation).catch(err =>
      console.error('[DonationController] Background match error:', err.message)
    );

    return res.status(201).json({
      success: true,
      message: 'Donation listed. Matching NGOs are being notified.',
      donation,
    });
  } catch (error) {
    console.error('[DonationController] listDonation error:', error);
    return res.status(500).json({ success: false, message: 'Failed to list donation.', error: error.message });
  }
};

// Background helper — finds top NGOs using $nearSphere and sends notifications
const findAndNotifyNGOs = async (donation) => {
  const matches = await NGO.find({
    verified: true,
    location: {
      $nearSphere: {
        $geometry: donation.location,
        $maxDistance: 50000, // 50km in meters
      },
    },
    ...(donation.coldChain ? { coldChain: true } : {}),
  }).limit(10);

  if (matches.length === 0) return;

  // Score each NGO
  const scored = matches.map(ngo => {
    const categoryMatch = ngo.wishlist.includes(donation.category) ? 1.0
      : ngo.wishlist.some(w => donation.category?.toLowerCase().includes(w)) ? 0.5 : 0;
    const reliability = ngo.reliabilityScore || 0.75;
    const capacity = donation.coldChain ? (ngo.coldChain ? 1 : 0) : 1;
    // Weights: 40% proximity (already handled by $nearSphere), 35% drug need, 15% reliability, 10% capacity
    const score = categoryMatch * 0.35 + reliability * 0.15 + capacity * 0.10;
    return { ngo, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top3 = scored.slice(0, 3).map(s => s.ngo);

  // Update donation with notification time
  await Donation.findByIdAndUpdate(donation._id, { notifiedAt: new Date() });

  // Send notifications
  await notifyNGOs(donation, top3);
};

// GET /api/donations/match/:donationId  (any authenticated user)
// Returns the ranked NGO match list for a donation
export const matchNGOs = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.donationId);
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found.' });
    if (donation.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Donation is no longer available.' });
    }

    const ngos = await NGO.find({
      verified: true,
      location: {
        $nearSphere: {
          $geometry: donation.location,
          $maxDistance: 50000,
        },
      },
    }).limit(10);

    const scored = ngos.map(ngo => {
      const categoryMatch = ngo.wishlist.includes(donation.category) ? 1.0
        : ngo.wishlist.some(w => donation.category?.toLowerCase().includes(w)) ? 0.5 : 0;
      return {
        ngoId: ngo._id,
        name: ngo.name,
        phone: ngo.phone,
        email: ngo.email,
        categoryMatch,
        reliabilityScore: ngo.reliabilityScore,
        coldChain: ngo.coldChain,
        pickupsCompleted: ngo.pickupsCompleted,
        score: categoryMatch * 0.35 + (ngo.reliabilityScore || 0.75) * 0.15,
      };
    });

    scored.sort((a, b) => b.score - a.score);

    return res.status(200).json({
      success: true,
      donationId: donation._id,
      totalMatches: scored.length,
      matches: scored,
    });
  } catch (error) {
    console.error('[DonationController] matchNGOs error:', error);
    return res.status(500).json({ success: false, message: 'Matching failed.' });
  }
};

// POST /api/donations/claim/:donationId  (ngo only)
// Atomic MongoDB findOneAndUpdate — prevents two NGOs claiming the same donation
export const claimDonation = async (req, res) => {
  try {
    const ngo = await NGO.findOne({ userId: req.user.id });

    if (!ngo) return res.status(404).json({ success: false, message: 'NGO profile not found.' });
    if (!ngo.verified) return res.status(403).json({ success: false, message: 'Your NGO is pending admin verification.' });

    // findOneAndUpdate with status filter = atomic claim lock
    // If another NGO already claimed it, status is no longer 'available' and update returns null
    const donation = await Donation.findOneAndUpdate(
      { _id: req.params.donationId, status: 'available' },
      { $set: { status: 'claimed', claimedBy: ngo._id, claimedAt: new Date() } },
      { new: true }
    );

    if (!donation) {
      return res.status(400).json({ success: false, message: 'Donation is no longer available. Another NGO may have claimed it.' });
    }

    // Update NGO pickup count
    await NGO.findByIdAndUpdate(ngo._id, { $inc: { pickupsCompleted: 1 } });

    await AuditLog.create({
      donationId: donation._id,
      action: 'claimed',
      actorId: req.user.id,
      notes: `Claimed by NGO: ${ngo.name}`,
    });

    // Emit Socket.io event (server.js has io available globally)
    if (global.io) {
      global.io.emit('donation_claimed', {
        donationId: donation._id,
        claimedBy: ngo.name,
        drugName: donation.drugName,
      });
    }

    return res.status(200).json({ success: true, message: 'Donation claimed successfully.', donation });
  } catch (error) {
    console.error('[DonationController] claimDonation error:', error);
    return res.status(500).json({ success: false, message: 'Claim failed.', error: error.message });
  }
};

// GET /api/donations/browse  (public)
export const browseDonations = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { status: 'available' };
    if (category && category !== 'All') filter.category = category;
    if (search) filter.drugName = { $regex: search, $options: 'i' };

    const donations = await Donation.find(filter)
      .populate('donorId', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({ success: true, total: donations.length, donations });
  } catch (error) {
    console.error('[DonationController] browseDonations error:', error);
    return res.status(500).json({ success: false, message: 'Failed to browse donations.' });
  }
};

// GET /api/donations/my-listings  (donor only)
export const getMyListings = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user.id })
      .populate('claimedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, total: donations.length, donations });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch listings.' });
  }
};

// DELETE /api/donations/:donationId  (donor only)
export const cancelDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.donationId);
    if (!donation) return res.status(404).json({ success: false, message: 'Donation not found.' });
    if (donation.donorId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only cancel your own donations.' });
    }
    if (donation.status === 'claimed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a claimed donation.' });
    }

    await Donation.findByIdAndUpdate(req.params.donationId, { status: 'cancelled' });
    await AuditLog.create({ donationId: donation._id, action: 'cancelled', actorId: req.user.id });

    return res.status(200).json({ success: true, message: 'Donation cancelled.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to cancel.' });
  }
};
