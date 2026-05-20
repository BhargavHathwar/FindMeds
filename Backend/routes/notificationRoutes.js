// routes/notificationRoutes.js
import express from 'express';
import { notifyMatchedNGOs } from '../controllers/notificationController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/notifications/notify-ngos
router.post('/notify-ngos', verifyToken, notifyMatchedNGOs);

export default router;
