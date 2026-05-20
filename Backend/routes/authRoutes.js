// routes/authRoutes.js
import express from 'express';
import { registerUser, getMyProfile, saveFcmToken } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/auth/register — called after frontend Firebase signup
router.post('/register', registerUser);

// GET /api/auth/me — returns logged-in user profile
router.get('/me', verifyToken, getMyProfile);

// POST /api/auth/fcm-token — saves device push token
router.post('/fcm-token', verifyToken, saveFcmToken);

export default router;
