// routes/ngoRoutes.js
import express from 'express';
import {
  getNGODashboard,
  updateWishlist,
  getAllNGOs,
  verifyNGO,
  getPendingNGOs,
} from '../controllers/ngoController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.get('/all', getAllNGOs);

// NGO-only
router.get('/dashboard', verifyToken, requireRole('ngo'), getNGODashboard);
router.put('/wishlist', verifyToken, requireRole('ngo'), updateWishlist);

// Admin-only
router.get('/pending', verifyToken, requireRole('admin'), getPendingNGOs);
router.post('/verify/:ngoId', verifyToken, requireRole('admin'), verifyNGO);

export default router;
