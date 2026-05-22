// routes/analyticsRoutes.js
import express from 'express';
import { getAdminAnalytics, getDonorAnalytics } from '../controllers/analyticsController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
const router = express.Router();

router.get('/summary', verifyToken, requireRole('admin'), getAdminAnalytics);
router.get('/donor', verifyToken, requireRole('donor'), getDonorAnalytics);

export default router;
