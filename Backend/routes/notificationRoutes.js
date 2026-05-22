// routes/notificationRoutes.js
import express from 'express';
import { notifyNGOsRoute } from '../controllers/notificationController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/notifications/notify-ngos (manual trigger — admin only)
router.post('/notify-ngos', verifyToken, requireRole('admin'), notifyNGOsRoute);

export default router;
