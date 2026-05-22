// routes/barcodeRoutes.js
import express from 'express';
import { lookupBarcode, verifyBarcode } from '../controllers/barcodeController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
const router = express.Router();
router.get('/:barcode', verifyToken, lookupBarcode);
router.post('/verify', verifyToken, verifyBarcode);
export default router;
