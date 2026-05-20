// controllers/donationController.js
// Core logic: Donor lists a donation → 5 safety gates → matching NGOs found → NGO claims it.
// This maps directly to the Donate.jsx form, DonorDashboard.jsx, and DonorListings.jsx pages.

import { db, messaging } from '../config/firebase.js';
import { v4 as uuidv4 } from 'uuid';

// ─── Helpers ────────────────────────────────────────────────────────────────

// Haversine formula — returns distance in km between two lat/lng points
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Drugs that CANNOT be donated under any circumstance (Schedule H/H1/X)
const BLOCKED_CATEGORIES = ['opioid', 'controlled', 'narcotic', 'psychotropic'];
const BLOCKED_NAMES = [
  'morphine', 'codeine', 'tramadol', 'oxycodone', 'fentanyl',
  'alprazolam', 'diazepam', 'lorazepam', 'clonazepam',
];

// ─── Gate Check (5-gate verification pipeline) ──────────────────────────────

const runVerificationGates = (donationData) => {
  const gates = [];
  const { drugName, category, expiryDate, storageCondition, originalSeal, noWaterDamage } = donationData;

  // Gate 1: Drug is recognized (name must exist)
  gates.push({
    gate: 1,
    name: 'Drug Recognized',
    passed: Boolean(drugName && drugName.trim().length > 2),
    reason: 'Drug name is required and must be identifiable.',
  });

  // Gate 2: Expiry valid (must have 3+ months remaining)
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
  const expiry = new Date(expiryDate);
  gates.push({
    gate: 2,
    name: 'Expiry Valid (3+ months)',
    passed: expiry > threeMonthsFromNow,
    reason: `Expiry must be after ${threeMonthsFromNow.toDateString()}.`,
  });

  // Gate 3: Not a Schedule H/H1/X controlled substance
  const nameLC = (drugName || '').toLowerCase();
  const catLC = (category || '').toLowerCase();
  const isBlocked =
    BLOCKED_NAMES.some(n => nameLC.includes(n)) ||
    BLOCKED_CATEGORIES.some(c => catLC.includes(c));
  gates.push({
    gate: 3,
    name: 'Not Schedule H/H1/X',
    passed: !isBlocked,
    reason: 'Controlled substances and opioids cannot be donated.',
  });

  // Gate 4: Category classified (must not be empty)
  gates.push({
    gate: 4,
    name: 'Category Classified',
    passed: Boolean(category && category.trim().length > 0),
    reason: 'A medicine category must be selected.',
  });

  // Gate 5: Package integrity (at least original seal must be confirmed)
  gates.push({
    gate: 5,
    name: 'Package Integrity',
    passed: originalSeal === true,
    reason: 'Original seal must be intact for patient safety.',
  });

  const allPassed = gates.every(g => g.passed);
  return { allPassed, gates };
};

// ─── Controllers ────────────────────────────────────────────────────────────

// POST /api/donations/list
// Donor submits the Donate.jsx form — this saves it to Firestore
export const listDonation = async (req, res) => {
  try {
    const {
      drugName, category, manufacturer, batchNumber, quantity, quantityUnit,
      expiryDate, storageCondition, originalSeal, noWaterDamage, sterilePackaging,
      description, pincode, lat, lng, photoUrl,
    } = req.body;

    const donorUid = req.user.uid;

    // Run all 5 safety gates
    const { allPassed, gates } = runVerificationGates({
      drugName, category, expiryDate, storageCondition, originalSeal,
    });

    if (!allPassed) {
      return res.status(422).json({
        success: false,
        message: 'Donation failed verification. Please check the gate results.',
        gates,
      });
    }

    const donationId = uuidv4();
    const coldChain = storageCondition === 'refrigerated';

    // Build the Firestore donation document (matches Member 3's schema)
    const donation = {
      donationId,
      donorUid,
      drugName,
      category,
      manufacturer: manufacturer || null,
      batchNumber: batchNumber || null,
      quantity: Number(quantity),
      quantityUnit: quantityUnit || 'Units',
      expiryDate,
      storageCondition,
      coldChain,
      originalSeal: Boolean(originalSeal),
      noWaterDamage: Boolean(noWaterDamage),
      sterilePackaging: Boolean(sterilePackaging),
      description: description || null,
      photoUrl: photoUrl || null,
      pincode: pincode || null,
      lat: lat || null,
      lng: lng || null,
      geoHash: null, // Member 3 will add GeoFirestore hashing
      status: 'available',
      claimedBy: null,
      listedAt: new Date().toISOString(),
      gates, // Store gate results for audit
    };

    await db.collection('donations').doc(donationId).set(donation);

    // Write to audit_log
    await db.collection('audit_logs').add({
      donationId,
      action: 'listed',
      actorUid: donorUid,
      timestamp: new Date().toISOString(),
      notes: `Donation listed: ${drugName} (${quantity} ${quantityUnit})`,
    });

    // Increment donor's total donations count
    const userRef = db.collection('users').doc(donorUid);
    const userSnap = await userRef.get();
    if (userSnap.exists) {
      await userRef.update({
        totalDonations: (userSnap.data().totalDonations || 0) + 1,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Donation listed successfully. Matching NGOs now being found.',
      donationId,
      gates,
    });
  } catch (error) {
    console.error('[DonationController] listDonation error:', error);
    return res.status(500).json({ success: false, message: 'Failed to list donation.', error: error.message });
  }
};

// GET /api/donations/match/:donationId
// Returns ranked list of NGOs that match this donation (Haversine + weighted score)
export const matchNGOs = async (req, res) => {
  try {
    const { donationId } = req.params;

    const donationSnap = await db.collection('donations').doc(donationId).get();
    if (!donationSnap.exists) {
      return res.status(404).json({ success: false, message: 'Donation not found.' });
    }
    const donation = donationSnap.data();

    if (donation.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Donation is no longer available.' });
    }

    // Get all verified NGOs
    const ngoSnap = await db.collection('ngos').where('verified', '==', true).get();
    if (ngoSnap.empty) {
      return res.status(200).json({ success: true, matches: [], message: 'No verified NGOs available yet.' });
    }

    const matches = [];

    ngoSnap.forEach(doc => {
      const ngo = doc.data();

      // Skip NGOs without location data
      if (!ngo.location?.latitude || !ngo.location?.longitude) return;

      // Skip NGOs that can't handle cold-chain if required
      if (donation.coldChain && !ngo.coldChain) return;

      // Calculate distance
      const distance = haversineDistance(
        donation.lat || 0, donation.lng || 0,
        ngo.location.latitude, ngo.location.longitude
      );

      // Only match within 50km radius
      if (distance > 50) return;

      // Check if NGO's wishlist includes this category
      const categoryMatch = ngo.wishlist?.includes(donation.category) ? 1 : 0;

      // Weighted score: closer = higher score, high reliability = higher score, wishlist match bonus
      const distanceScore = Math.max(0, 1 - distance / 50); // 0–1
      const reliabilityScore = ngo.reliabilityScore || 0;   // 0–1
      const totalScore =
        distanceScore * 0.5 +
        reliabilityScore * 0.35 +
        categoryMatch * 0.15;

      matches.push({
        ngoId: ngo.ngoId,
        name: ngo.name,
        distance: Math.round(distance * 10) / 10, // km, 1 decimal
        reliabilityScore: ngo.reliabilityScore,
        pickupsCompleted: ngo.pickupsCompleted,
        coldChain: ngo.coldChain,
        categoryMatch: Boolean(categoryMatch),
        totalScore: Math.round(totalScore * 100) / 100,
        fcmToken: ngo.fcmToken,
        phone: ngo.phone,
      });
    });

    // Sort by score descending — best match first
    matches.sort((a, b) => b.totalScore - a.totalScore);

    return res.status(200).json({
      success: true,
      donationId,
      totalMatches: matches.length,
      matches: matches.slice(0, 5), // Return top 5
    });
  } catch (error) {
    console.error('[DonationController] matchNGOs error:', error);
    return res.status(500).json({ success: false, message: 'Matching failed.', error: error.message });
  }
};

// POST /api/donations/claim/:donationId
// NGO claims a donation — uses Firestore transaction to prevent double-claiming
export const claimDonation = async (req, res) => {
  try {
    const { donationId } = req.params;
    const ngoUid = req.user.uid;

    // Verify the claimer is actually an NGO
    if (req.user.role !== 'ngo') {
      return res.status(403).json({ success: false, message: 'Only NGOs can claim donations.' });
    }

    // Verify the NGO is verified by admin
    const ngoSnap = await db.collection('ngos').doc(ngoUid).get();
    if (!ngoSnap.exists || !ngoSnap.data().verified) {
      return res.status(403).json({ success: false, message: 'Your NGO account is pending verification.' });
    }

    // Atomic Firestore transaction — prevents two NGOs claiming simultaneously
    await db.runTransaction(async (transaction) => {
      const donationRef = db.collection('donations').doc(donationId);
      const donationDoc = await transaction.get(donationRef);

      if (!donationDoc.exists) {
        throw new Error('Donation not found.');
      }

      const donation = donationDoc.data();
      if (donation.status !== 'available') {
        throw new Error('This donation has already been claimed.');
      }

      // Claim it
      transaction.update(donationRef, {
        status: 'claimed',
        claimedBy: ngoUid,
        claimedAt: new Date().toISOString(),
      });
    });

    // Write audit log
    await db.collection('audit_logs').add({
      donationId,
      action: 'claimed',
      actorUid: ngoUid,
      timestamp: new Date().toISOString(),
      notes: `Claimed by NGO: ${ngoSnap.data().name}`,
    });

    // Increment NGO's pickups count
    await db.collection('ngos').doc(ngoUid).update({
      pickupsCompleted: (ngoSnap.data().pickupsCompleted || 0) + 1,
    });

    return res.status(200).json({
      success: true,
      message: 'Donation claimed successfully.',
      donationId,
      claimedBy: ngoUid,
    });
  } catch (error) {
    console.error('[DonationController] claimDonation error:', error);
    const isBusinessError = error.message.includes('already been claimed') || error.message.includes('not found');
    return res.status(isBusinessError ? 400 : 500).json({
      success: false,
      message: error.message || 'Claim failed.',
    });
  }
};

// GET /api/donations/my-listings  (protected — donor only)
// Returns all donations listed by the logged-in donor (for DonorListings.jsx)
export const getMyListings = async (req, res) => {
  try {
    const snap = await db
      .collection('donations')
      .where('donorUid', '==', req.user.uid)
      .orderBy('listedAt', 'desc')
      .get();

    const donations = snap.docs.map(doc => doc.data());
    return res.status(200).json({ success: true, total: donations.length, donations });
  } catch (error) {
    console.error('[DonationController] getMyListings error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch listings.' });
  }
};

// GET /api/donations/browse  (public)
// Returns available donations for BrowseMedicine.jsx
export const browseDonations = async (req, res) => {
  try {
    const { category, search } = req.query;

    let query = db.collection('donations').where('status', '==', 'available');

    if (category && category !== 'All') {
      query = query.where('category', '==', category);
    }

    const snap = await query.orderBy('listedAt', 'desc').limit(50).get();

    let donations = snap.docs.map(doc => doc.data());

    // Client-side search filter (Firestore doesn't support full-text search natively)
    if (search) {
      const q = search.toLowerCase();
      donations = donations.filter(d =>
        d.drugName?.toLowerCase().includes(q) ||
        d.category?.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({ success: true, total: donations.length, donations });
  } catch (error) {
    console.error('[DonationController] browseDonations error:', error);
    return res.status(500).json({ success: false, message: 'Failed to browse donations.' });
  }
};

// DELETE /api/donations/:donationId  (protected — donor only)
// Cancel a donation that hasn't been claimed yet (from DonorListings.jsx Cancel button)
export const cancelDonation = async (req, res) => {
  try {
    const { donationId } = req.params;

    const donationRef = db.collection('donations').doc(donationId);
    const snap = await donationRef.get();

    if (!snap.exists) {
      return res.status(404).json({ success: false, message: 'Donation not found.' });
    }

    const donation = snap.data();

    if (donation.donorUid !== req.user.uid) {
      return res.status(403).json({ success: false, message: 'You can only cancel your own donations.' });
    }

    if (donation.status === 'claimed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a donation that has already been claimed.' });
    }

    await donationRef.update({ status: 'cancelled', cancelledAt: new Date().toISOString() });

    await db.collection('audit_logs').add({
      donationId,
      action: 'cancelled',
      actorUid: req.user.uid,
      timestamp: new Date().toISOString(),
      notes: 'Cancelled by donor.',
    });

    return res.status(200).json({ success: true, message: 'Donation cancelled.' });
  } catch (error) {
    console.error('[DonationController] cancelDonation error:', error);
    return res.status(500).json({ success: false, message: 'Failed to cancel donation.' });
  }
};
