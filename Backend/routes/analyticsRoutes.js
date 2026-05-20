// routes/analyticsRoutes.js
import express from 'express';
import { getAdminAnalytics, getDonorStats } from '../controllers/analyticsController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/analytics/summary — admin overview (AdminPortal.jsx)
router.get('/summary', verifyToken, requireRole('admin'), getAdminAnalytics);

// GET /api/analytics/donor — personal stats (DonorDashboard.jsx)
router.get('/donor', verifyToken, requireRole('donor'), getDonorStats);

export default router;
