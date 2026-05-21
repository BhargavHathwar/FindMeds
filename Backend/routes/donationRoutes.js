// routes/donationRoutes.js
import express from 'express';
import {
  listDonation, matchNGOs, claimDonation,
  browseDonations, getMyListings, cancelDonation,
} from '../controllers/donationController.js';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
const router = express.Router();

router.get('/browse', browseDonations);
router.get('/my-listings', verifyToken, requireRole('donor'), getMyListings);
router.post('/list', verifyToken, requireRole('donor'), upload.single('photo'), listDonation);
router.get('/match/:donationId', verifyToken, matchNGOs);
router.post('/claim/:donationId', verifyToken, requireRole('ngo'), claimDonation);
router.delete('/:donationId', verifyToken, requireRole('donor'), cancelDonation);

export default router;
