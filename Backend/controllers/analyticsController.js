// controllers/analyticsController.js
// MongoDB aggregation pipeline for admin + donor dashboards.
// Month 3 task: GET /api/analytics

import Donation from '../models/Donation.js';
import NGO from '../models/NGO.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

// GET /api/analytics/summary  (admin only)
export const getAdminAnalytics = async (req, res) => {
  try {
    // Parallel queries for speed
    const [statusBreakdown, categoryBreakdown, totalNGOs, totalUsers, recentLogs] =
      await Promise.all([
        // Status breakdown via aggregation
        Donation.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        // Category breakdown
        Donation.aggregate([
          { $match: { status: 'available' } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
        NGO.countDocuments({ verified: true }),
        User.countDocuments(),
        AuditLog.find().sort({ createdAt: -1 }).limit(20).populate('actorId', 'name email'),
      ]);

    // Flatten status breakdown into a simple object
    const stats = { totalDonations: 0, available: 0, claimed: 0, cancelled: 0, auto_expired: 0 };
    statusBreakdown.forEach(s => {
      stats[s._id] = s.count;
      stats.totalDonations += s.count;
    });

    return res.status(200).json({
      success: true,
      stats: { ...stats, totalVerifiedNGOs: totalNGOs, totalUsers },
      categoryBreakdown,
      recentActivity: recentLogs,
    });
  } catch (error) {
    console.error('[AnalyticsController] getAdminAnalytics error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load analytics.' });
  }
};

// GET /api/analytics/donor  (donor only)
export const getDonorAnalytics = async (req, res) => {
  try {
    const [statusBreakdown, recentDonations] = await Promise.all([
      Donation.aggregate([
        { $match: { donorId: req.user.id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Donation.find({ donorId: req.user.id })
        .populate('claimedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const stats = { total: 0, available: 0, claimed: 0, cancelled: 0 };
    statusBreakdown.forEach(s => {
      stats[s._id] = s.count;
      stats.total += s.count;
    });

    return res.status(200).json({ success: true, stats, recentDonations });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load donor analytics.' });
  }
};
