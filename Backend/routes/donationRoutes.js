// routes/donationRoutes.js
import express from 'express';
import {
  listDonation,
  matchNGOs,
  claimDonation,
  getMyListings,
  browseDonations,
  cancelDonation,
} from '../controllers/donationController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.get('/browse', browseDonations);

// Protected — any logged-in user
router.post('/list', verifyToken, requireRole('donor'), listDonation);
router.get('/my-listings', verifyToken, requireRole('donor'), getMyListings);
router.delete('/:donationId', verifyToken, requireRole('donor'), cancelDonation);

// Matching — donor sees top NGOs for their donation
router.get('/match/:donationId', verifyToken, matchNGOs);

// NGO claim
router.post('/claim/:donationId', verifyToken, requireRole('ngo'), claimDonation);

export default router;
