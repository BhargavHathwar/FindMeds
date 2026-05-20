// controllers/ngoController.js
// Handles NGO-specific operations:
// - View/manage their inventory (NGODashboard.jsx)
// - Update wishlist (what medicines they need)
// - Admin: verify NGO via Darpan API (AdminPortal.jsx)

import { db } from '../config/firebase.js';
import axios from 'axios';

// GET /api/ngo/dashboard  (protected — ngo only)
// Returns the NGO's inventory (claimed donations they hold), stats, and pending requests
export const getNGODashboard = async (req, res) => {
  try {
    const ngoId = req.user.uid;

    // Get NGO profile
    const ngoSnap = await db.collection('ngos').doc(ngoId).get();
    if (!ngoSnap.exists) {
      return res.status(404).json({ success: false, message: 'NGO profile not found.' });
    }

    // Get all donations claimed by this NGO
    const claimedSnap = await db
      .collection('donations')
      .where('claimedBy', '==', ngoId)
      .orderBy('claimedAt', 'desc')
      .get();

    const inventory = claimedSnap.docs.map(doc => {
      const d = doc.data();
      const expiryDate = new Date(d.expiryDate);
      const now = new Date();
      const monthsLeft = (expiryDate - now) / (1000 * 60 * 60 * 24 * 30);

      let status = 'Healthy';
      if (monthsLeft < 1) status = 'Critical Level';
      else if (monthsLeft < 3) status = 'Expiring Soon';

      return {
        donationId: d.donationId,
        name: d.drugName,
        batch: d.batchNumber || 'N/A',
        expiry: d.expiryDate,
        qty: d.quantity,
        quantityUnit: d.quantityUnit,
        status,
        category: d.category,
      };
    });

    // Get available donations near this NGO (incoming donors on map)
    const availableSnap = await db
      .collection('donations')
      .where('status', '==', 'available')
      .limit(10)
      .get();
    const available = availableSnap.docs.map(doc => doc.data());

    const ngo = ngoSnap.data();

    return res.status(200).json({
      success: true,
      ngo: {
        ngoId: ngo.ngoId,
        name: ngo.name,
        verified: ngo.verified,
        reliabilityScore: ngo.reliabilityScore,
        pickupsCompleted: ngo.pickupsCompleted,
        wishlist: ngo.wishlist,
      },
      stats: {
        totalStock: inventory.reduce((sum, i) => sum + i.qty, 0),
        criticalItems: inventory.filter(i => i.status === 'Critical Level').length,
        expiringItems: inventory.filter(i => i.status === 'Expiring Soon').length,
      },
      inventory,
      availableDonations: available,
    });
  } catch (error) {
    console.error('[NGOController] getNGODashboard error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load NGO dashboard.' });
  }
};

// PUT /api/ngo/wishlist  (protected — ngo only)
// NGO updates their medicine wishlist (drives the matching score)
export const updateWishlist = async (req, res) => {
  try {
    const { wishlist } = req.body;

    if (!Array.isArray(wishlist)) {
      return res.status(400).json({ success: false, message: 'wishlist must be an array of category strings.' });
    }

    await db.collection('ngos').doc(req.user.uid).update({ wishlist });

    return res.status(200).json({ success: true, message: 'Wishlist updated.', wishlist });
  } catch (error) {
    console.error('[NGOController] updateWishlist error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update wishlist.' });
  }
};

// GET /api/ngo/all  (public)
// Returns verified NGOs for BrowseMedicine.jsx NGO Registry section
export const getAllNGOs = async (req, res) => {
  try {
    const snap = await db.collection('ngos').where('verified', '==', true).get();

    const ngos = snap.docs.map(doc => {
      const n = doc.data();
      return {
        ngoId: n.ngoId,
        name: n.name,
        location: n.location,
        coldChain: n.coldChain,
        reliabilityScore: n.reliabilityScore,
        pickupsCompleted: n.pickupsCompleted,
        wishlist: n.wishlist,
      };
    });

    return res.status(200).json({ success: true, total: ngos.length, ngos });
  } catch (error) {
    console.error('[NGOController] getAllNGOs error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch NGOs.' });
  }
};

// POST /api/ngo/verify/:ngoId  (protected — admin only)
// Admin verifies an NGO via Darpan API (AdminPortal.jsx verification queue)
export const verifyNGO = async (req, res) => {
  try {
    const { ngoId } = req.params;
    const { approved } = req.body; // true = approve, false = reject

    const ngoSnap = await db.collection('ngos').doc(ngoId).get();
    if (!ngoSnap.exists) {
      return res.status(404).json({ success: false, message: 'NGO not found.' });
    }

    const ngo = ngoSnap.data();

    // Check against Darpan API if darpanId is provided
    let darpanVerified = false;
    if (ngo.darpanId && process.env.DARPAN_API_KEY) {
      try {
        const darpanRes = await axios.get(
          `https://darpan.gov.in/api/ngo/verify/${ngo.darpanId}`,
          {
            headers: { 'Authorization': `Bearer ${process.env.DARPAN_API_KEY}` },
            timeout: 5000,
          }
        );
        darpanVerified = darpanRes.data?.verified === true;
      } catch (darpanErr) {
        console.warn('[NGOController] Darpan API check failed:', darpanErr.message);
        // Proceed with manual admin approval — Darpan API may be unavailable
      }
    }

    await db.collection('ngos').doc(ngoId).update({
      verified: approved === true,
      darpanVerified,
      verifiedAt: new Date().toISOString(),
      verifiedBy: req.user.uid,
    });

    await db.collection('audit_logs').add({
      donationId: null,
      action: approved ? 'ngo_approved' : 'ngo_rejected',
      actorUid: req.user.uid,
      timestamp: new Date().toISOString(),
      notes: `NGO ${ngo.name} ${approved ? 'approved' : 'rejected'}. Darpan verified: ${darpanVerified}`,
    });

    return res.status(200).json({
      success: true,
      message: `NGO ${approved ? 'approved' : 'rejected'} successfully.`,
      darpanVerified,
    });
  } catch (error) {
    console.error('[NGOController] verifyNGO error:', error);
    return res.status(500).json({ success: false, message: 'NGO verification failed.' });
  }
};

// GET /api/ngo/pending  (protected — admin only)
// Returns NGOs awaiting admin verification (AdminPortal.jsx queue)
export const getPendingNGOs = async (req, res) => {
  try {
    const snap = await db.collection('ngos').where('verified', '==', false).get();

    const pending = snap.docs.map(doc => {
      const n = doc.data();
      return {
        ngoId: n.ngoId,
        name: n.name,
        email: n.email,
        darpanId: n.darpanId,
        createdAt: n.createdAt,
      };
    });

    return res.status(200).json({ success: true, total: pending.length, pending });
  } catch (error) {
    console.error('[NGOController] getPendingNGOs error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch pending NGOs.' });
  }
};
