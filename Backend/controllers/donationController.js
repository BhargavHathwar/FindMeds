// controllers/donationController.js
// Data & DevOps Enhanced Edition — Integrates Native Text Indexes and Robust Status Gates

import Donation from '../models/Donation.js';
import NGO from '../models/NGO.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { uploadToCloudinary } from '../middleware/uploadMiddleware.js';
import { notifyNGOs } from './notificationController.js';

// POST /api/donations/list  (donor only)
export const listDonation = async (req, res) => {
  try {
    const {
      drugName, category, manufacturer, batchNumber, quantity, quantityUnit,
      expiryDate, storageCondition, originalSeal, noWaterDamage, sterilePackaging,
      description, pincode, lat, lng, gates,
    } = req.body;

    // Upload to Cloudinary if file attachment metadata is included
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

    // Increment donor's lifetime trace counter metrics
    await User.findByIdAndUpdate(req.user.id, { $inc: { totalDonations: 1 } });

    // Write persistent transaction history trail
    await AuditLog.create({
      donationId: donation._id,
      action: 'listed',
      actorId: req.user.id,
      notes: `${drugName} (${quantity} ${quantityUnit || 'Units'}) listed smoothly onto cloud cluster.`,
    });

    // Fire background proximity match task asynchronously
    findAndNotifyNGOs(donation).catch(err =>
      console.error('[DonationController] Background match engine error trace:', err.message)
    );

    return res.status(201).json({
      success: true,
      message: 'Donation listed successfully. Automated proximity sweeps are notifying nearby NGOs.',
      donation,
    });
  } catch (error) {
    console.error('[DonationController] listDonation execution failure:', error);
    return res.status(500).json({ success: false, message: 'Failed to log medication listing.', error: error.message });
  }
};

// Background matcher — finds top NGOs using $nearSphere spherical indices
const findAndNotifyNGOs = async (donation) => {
  const matches = await NGO.find({
    verified: true,
    location: {
      $nearSphere: {
        $geometry: donation.location,
        $maxDistance: 50000, // 50km represented in meters
      },
    },
    ...(donation.coldChain ? { coldChain: true } : {}),
  }).limit(10);

  if (matches.length === 0) return;

  // Process algorithmic capacity/wishlist prioritization metrics
  const scored = matches.map(ngo => {
    const categoryMatch = ngo.wishlist.includes(donation.category) ? 1.0
      : ngo.wishlist.some(w => donation.category?.toLowerCase().includes(w)) ? 0.5 : 0;
    const reliability = ngo.reliabilityScore || 0.75;
    const capacity = donation.coldChain ? (ngo.coldChain ? 1 : 0) : 1;
    
    // Weighted configuration calculation loop matrix
    const score = categoryMatch * 0.35 + reliability * 0.15 + capacity * 0.10;
    return { ngo, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top3 = scored.slice(0, 3).map(s => s.ngo);

  // Mark synchronization update timestamp
  await Donation.findByIdAndUpdate(donation._id, { notifiedAt: new Date() });

  // Discard to cross-microservice notifier pipeline
  await notifyNGOs(donation, top3);
};

// GET /api/donations/match/:donationId
export const matchNGOs = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.donationId);
    if (!donation) return res.status(404).json({ success: false, message: 'Donation tracking ID unrecognized.' });
    
    // Tightened validation block ensuring safety filters catch dead records
    if (donation.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Medication allocation threshold closed (Claimed, Cancelled, or Expired).' });
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
    console.error('[DonationController] matchNGOs query failure:', error);
    return res.status(500).json({ success: false, message: 'Proximity matrix sorting failed.' });
  }
};

// POST /api/donations/claim/:donationId  (NGO only)
export const claimDonation = async (req, res) => {
  try {
    const ngo = await NGO.findOne({ userId: req.user.id });

    if (!ngo) return res.status(404).json({ success: false, message: 'NGO profiles must be generated to execute claims.' });
    if (!ngo.verified) return res.status(403).json({ success: false, message: 'Your credential suite is pending administrative review verification.' });

    // Thread-safe atomic findOneAndUpdate execution block handles concurrent requests gracefully
    const donation = await Donation.findOneAndUpdate(
      { _id: req.params.donationId, status: 'available' },
      { $set: { status: 'claimed', claimedBy: ngo._id, claimedAt: new Date() } },
      { new: true }
    );

    if (!donation) {
      return res.status(400).json({ success: false, message: 'Listing unassigned. Medication may have expired or been claimed by another center.' });
    }

    // Advance performance tracking values
    await NGO.findByIdAndUpdate(ngo._id, { $inc: { pickupsCompleted: 1 } });

    await AuditLog.create({
      donationId: donation._id,
      action: 'claimed',
      actorId: req.user.id,
      notes: `Redistribution channel locked. Claim verified by NGO entity: ${ngo.name}`,
    });

    // Real-Time Socket Interconnection Synchronization Trigger Broadcast
    if (global.io) {
      global.io.emit('donation_claimed', {
        donationId: donation._id,
        claimedBy: ngo.name,
        drugName: donation.drugName,
      });
    }

    return res.status(200).json({ success: true, message: 'Donation vector claimed and locked down successfully.', donation });
  } catch (error) {
    console.error('[DonationController] claimDonation atomic thread error:', error);
    return res.status(500).json({ success: false, message: 'Claim authorization request failed.', error: error.message });
  }
};

// GET /api/donations/browse  (public navigation query interface)
export const browseDonations = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { status: 'available' };
    
    if (category && category !== 'All') filter.category = category;
    
    // ⚡ DEVOPS PERFORMANCE UPGRADE: Swapped slow character RegEx for your high-speed Text Index Query rules!
    if (search) {
      filter.$text = { $search: search };
    }

    const donations = await Donation.find(filter)
      .populate('donorId', 'name email')
      .sort(search ? { score: { $meta: "textScore" } } : { createdAt: -1 }) // Sorts by keyword matching accuracy if a search query is active
      .limit(50);

    return res.status(200).json({ success: true, total: donations.length, donations });
  } catch (error) {
    console.error('[DonationController] browseDonations core filter crash:', error);
    return res.status(500).json({ success: false, message: 'Failed to aggregate market listings.' });
  }
};

// GET /api/donations/my-listings  (donor tracing panel helper)
export const getMyListings = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user.id })
      .populate('claimedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, total: donations.length, donations });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load tracking data.' });
  }
};

// DELETE /api/donations/:donationId  (donor revocation mechanism)
export const cancelDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.donationId);
    if (!donation) return res.status(404).json({ success: false, message: 'Target entry item not found.' });
    if (donation.donorId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Revocation blocked: Authorization constraints restrict modifications to original owner profiles.' });
    }
    if (donation.status === 'claimed') {
      return res.status(400).json({ success: false, message: 'Active claim locked down. Listed distributions already dispatched cannot be revoked.' });
    }

    await Donation.findByIdAndUpdate(req.params.donationId, { status: 'cancelled' });
    await AuditLog.create({ donationId: donation._id, action: 'cancelled', actorId: req.user.id });

    return res.status(200).json({ success: true, message: 'Distribution allocation cancelled smoothly.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to apply structural parameter changes.' });
  }
};