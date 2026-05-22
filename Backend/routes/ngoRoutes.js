// routes/ngoRoutes.js
import express from 'express';
import { getNGODashboard, updateWishlist, getAllNGOs, getPendingNGOs, verifyNGO } from '../controllers/ngoController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
const router = express.Router();

router.get('/all', getAllNGOs);
router.get('/dashboard', verifyToken, requireRole('ngo'), getNGODashboard);
router.put('/wishlist', verifyToken, requireRole('ngo'), updateWishlist);
router.get('/pending', verifyToken, requireRole('admin'), getPendingNGOs);
router.post('/verify/:ngoId', verifyToken, requireRole('admin'), verifyNGO);

export default router;
