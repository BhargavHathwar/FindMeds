// controllers/analyticsController.js
// Provides aggregate statistics for AdminPortal.jsx and DonorDashboard.jsx

import { db } from '../config/firebase.js';

// GET /api/analytics/summary  (protected — admin only)
// Returns platform-wide stats: total donations, claims, NGOs, flagged items
export const getAdminAnalytics = async (req, res) => {
  try {
    const [donationsSnap, ngosSnap, usersSnap, logsSnap] = await Promise.all([
      db.collection('donations').get(),
      db.collection('ngos').where('verified', '==', true).get(),
      db.collection('users').get(),
      db.collection('audit_logs').orderBy('timestamp', 'desc').limit(20).get(),
    ]);

    const donations = donationsSnap.docs.map(d => d.data());

    const stats = {
      totalDonations: donations.length,
      available: donations.filter(d => d.status === 'available').length,
      claimed: donations.filter(d => d.status === 'claimed').length,
      cancelled: donations.filter(d => d.status === 'cancelled').length,
      totalVerifiedNGOs: ngosSnap.size,
      totalUsers: usersSnap.size,
    };

    // Category breakdown
    const categoryMap = {};
    donations.forEach(d => {
      if (d.category) {
        categoryMap[d.category] = (categoryMap[d.category] || 0) + 1;
      }
    });

    // Recent audit logs
    const recentLogs = logsSnap.docs.map(doc => doc.data());

    return res.status(200).json({
      success: true,
      stats,
      categoryBreakdown: categoryMap,
      recentActivity: recentLogs,
    });
  } catch (error) {
    console.error('[AnalyticsController] getAdminAnalytics error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load analytics.' });
  }
};

// GET /api/analytics/donor/:uid  (protected — donor only)
// Returns a single donor's personal stats for DonorDashboard.jsx
export const getDonorStats = async (req, res) => {
  try {
    const donorUid = req.user.uid;

    const snap = await db
      .collection('donations')
      .where('donorUid', '==', donorUid)
      .get();

    const donations = snap.docs.map(d => d.data());

    return res.status(200).json({
      success: true,
      stats: {
        totalDonations: donations.length,
        claimed: donations.filter(d => d.status === 'claimed').length,
        available: donations.filter(d => d.status === 'available').length,
        cancelled: donations.filter(d => d.status === 'cancelled').length,
      },
      recentDonations: donations.slice(0, 5),
    });
  } catch (error) {
    console.error('[AnalyticsController] getDonorStats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to load donor stats.' });
  }
};
