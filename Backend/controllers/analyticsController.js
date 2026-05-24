// controllers/analyticsController.js
// Data & DevOps Edition — Integrates Physical Expiry States & Supply Unit Volume Tracking

import Donation from '../models/Donation.js';
import NGO from '../models/NGO.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

/**
 * 📊 GET /api/analytics/summary
 * Generates aggregated administrative metrics across collections in highly optimized parallel threads.
 * @access Admin Only
 */
export const getAdminAnalytics = async (req, res) => {
  try {
    console.log('[ANALYTICS PIPELINE] Executing parallel dashboard summaries...');

    // Parallel processing execution grid
    const [statusBreakdown, categoryBreakdown, totalNGOs, totalUsers, recentLogs] =
      await Promise.all([
        // 1. Status Breakdown Matrix (Accumulates total unit volume counts)
        Donation.aggregate([
          { 
            $group: { 
              _id: '$status', 
              count: { $sum: 1 },
              totalQuantity: { $sum: '$quantity' } // DevOps Upgrade: Tracking actual item units volume
            } 
          },
        ]),
        // 2. Supply Category Prioritization Analytics
        Donation.aggregate([
          { $match: { status: 'available' } },
          { $group: { _id: '$category', count: { $sum: 1 }, itemsUnits: { $sum: '$quantity' } } },
          { $sort: { itemsUnits: -1 } }, // Sorted by most unit volume supplied
          { $limit: 10 },
        ]),
        NGO.countDocuments({ verified: true }),
        User.countDocuments(),
        AuditLog.find()
          .sort({ createdAt: -1 })
          .limit(20)
          .populate('actorId', 'name email'),
      ]);

    // Initialize map including your active DevOps tracker states
    const stats = { 
      totalDonationsCount: 0, 
      totalUnitsVolume: 0,
      available: 0, 
      claimed: 0, 
      cancelled: 0, 
      auto_expired: 0,
      expired: 0 // DevOps Upgrade: Accommodates your automated background shelf-life tracker state!
    };

    // Flatten aggregated distribution objects cleanly
    statusBreakdown.forEach(s => {
      if (s._id in stats) {
        stats[s._id] = s.count;
      }
      stats.totalDonationsCount += s.count;
      stats.totalUnitsVolume += (s.totalQuantity || 0);
    });

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      stats: { 
        ...stats, 
        totalVerifiedNGOs: totalNGOs, 
        totalUsers 
      },
      categoryBreakdown,
      recentActivity: recentLogs,
    });
  } catch (error) {
    console.error('[AnalyticsController] getAdminAnalytics data compilation error:', error);
    return res.status(500).json({ success: false, message: 'Failed to aggregate administrative telemetry metrics.' });
  }
};

/**
 * 📈 GET /api/analytics/donor
 * Aggregates specific impact charts tracking a single user profile footprint.
 * @access Donor Only
 */
export const getDonorAnalytics = async (req, res) => {
  try {
    const [statusBreakdown, recentDonations] = await Promise.all([
      // Status metrics isolated strictly to matching session token properties
      Donation.aggregate([
        { $match: { donorId: req.user.id } },
        { $group: { _id: '$status', count: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } },
      ]),
      Donation.find({ donorId: req.user.id })
        .populate('claimedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    // Synchronize default tracker properties with system definitions
    const stats = { totalListings: 0, totalUnitsDonated: 0, available: 0, claimed: 0, cancelled: 0, auto_expired: 0, expired: 0 };
    
    statusBreakdown.forEach(s => {
      if (s._id in stats) {
        stats[s._id] = s.count;
      }
      stats.totalListings += s.count;
      stats.totalUnitsDonated += (s.totalQuantity || 0);
    });

    return res.status(200).json({ 
      success: true, 
      stats, 
      recentDonations 
    });
  } catch (error) {
    console.error('[AnalyticsController] getDonorAnalytics calculation failure:', error);
    return res.status(500).json({ success: false, message: 'Failed to load customized donor analytics profile.' });
  }
};