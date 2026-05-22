// controllers/ngoController.js
// NGO dashboard (inventory + stats), wishlist editor, admin verification via Darpan API.

import NGO from '../models/NGO.js';
import Donation from '../models/Donation.js';
import AuditLog from '../models/AuditLog.js';
import axios from 'axios';

// GET /api/ngo/dashboard  (ngo only)
export const getNGODashboard = async (req, res) => {
  try {
    const ngo = await NGO.findOne({ userId: req.user.id });
    if (!ngo) return res.status(404).json({ success: false, message: 'NGO profile not found.' });

    // All donations claimed by this NGO = their inventory
    const inventory = await Donation.find({ claimedBy: ngo._id }).sort({ createdAt: -1 });

    // Tag each item with health status
    const now = new Date();
    const tagged = inventory.map(d => {
      const monthsLeft = (new Date(d.expiryDate) - now) / (1000 * 60 * 60 * 24 * 30);
      const status =
        monthsLeft < 1 ? 'Critical Level' :
        monthsLeft < 3 ? 'Expiring Soon' : 'Healthy';
      return { ...d.toObject(), healthStatus: status };
    });

    // Available donations nearby for the map panel
    const nearby = ngo.location?.coordinates?.[0]
      ? await Donation.find({
          status: 'available',
          location: {
            $nearSphere: {
              $geometry: ngo.location,
              $maxDistance: 50000,
            },
          },
        }).limit(10).populate('donorId', 'name email')
      : [];

    return res.status(200).json({
      success: true,
      ngo: {
        id: ngo._id,
        name: ngo.name,
        verified: ngo.verified,
        reliabilityScore: ngo.reliabilityScore,
        pickupsCompleted: ngo.pickupsCompleted,
        wishlist: ngo.wishlist,
        coldChain: ngo.coldChain,
      },
      stats: {
        totalStock: tagged.reduce((s, i) => s + i.quantity, 0),
        totalItems: tagged.length,
        criticalItems: tagged.filter(i => i.healthStatus === 'Critical Level').length,
        expiringItems: tagged.filter(i => i.healthStatus === 'Expiring Soon').length,
      },
      inventory: tagged,
      nearbyDonations: nearby,
    });
  } catch (error) {
    console.error('[NGOController] getDashboard error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load dashboard.' });
  }
};

// PUT /api/ngo/wishlist  (ngo only)
export const updateWishlist = async (req, res) => {
  try {
    const { wishlist, location, coldChain, phone } = req.body;
    const update = {};
    if (Array.isArray(wishlist)) update.wishlist = wishlist;
    if (coldChain !== undefined) update.coldChain = Boolean(coldChain);
    if (phone) update.phone = phone;
    if (location?.lat && location?.lng) {
      update.location = {
        type: 'Point',
        coordinates: [parseFloat(location.lng), parseFloat(location.lat)],
      };
    }

    const ngo = await NGO.findOneAndUpdate({ userId: req.user.id }, { $set: update }, { new: true });
    if (!ngo) return res.status(404).json({ success: false, message: 'NGO not found.' });

    return res.status(200).json({ success: true, message: 'NGO profile updated.', ngo });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update.' });
  }
};

// GET /api/ngo/all  (public)
export const getAllNGOs = async (req, res) => {
  try {
    const ngos = await NGO.find({ verified: true }).select('-__v');
    return res.status(200).json({ success: true, total: ngos.length, ngos });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch NGOs.' });
  }
};

// GET /api/ngo/pending  (admin only)
export const getPendingNGOs = async (req, res) => {
  try {
    const pending = await NGO.find({ verified: false }).select('name email darpanId createdAt userId');
    return res.status(200).json({ success: true, total: pending.length, pending });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch pending NGOs.' });
  }
};

// POST /api/ngo/verify/:ngoId  (admin only)
// Checks Darpan API + sets verified flag
export const verifyNGO = async (req, res) => {
  try {
    const { approved } = req.body;
    const ngo = await NGO.findById(req.params.ngoId);
    if (!ngo) return res.status(404).json({ success: false, message: 'NGO not found.' });

    let darpanVerified = false;

    // Check Darpan API if darpanId exists
    if (ngo.darpanId && process.env.DARPAN_API_KEY) {
      try {
        const res = await axios.get(
          `https://darpan.gov.in/api/ngo/verify/${ngo.darpanId}`,
          { headers: { Authorization: `Bearer ${process.env.DARPAN_API_KEY}` }, timeout: 5000 }
        );
        darpanVerified = res.data?.verified === true;
      } catch (err) {
        console.warn('[NGOController] Darpan API failed — proceeding with manual approval:', err.message);
      }
    }

    await NGO.findByIdAndUpdate(req.params.ngoId, {
      verified: approved === true,
      darpanVerified,
      verifiedAt: new Date(),
      verifiedBy: req.user.id,
    });

    await AuditLog.create({
      action: approved ? 'ngo_approved' : 'ngo_rejected',
      actorId: req.user.id,
      notes: `NGO ${ngo.name} ${approved ? 'approved' : 'rejected'}. Darpan: ${darpanVerified}`,
    });

    return res.status(200).json({
      success: true,
      message: `NGO ${approved ? 'approved' : 'rejected'}.`,
      darpanVerified,
    });
  } catch (error) {
    console.error('[NGOController] verifyNGO error:', error);
    return res.status(500).json({ success: false, message: 'Verification failed.' });
  }
};
