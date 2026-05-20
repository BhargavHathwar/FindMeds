// routes/barcodeRoutes.js
import express from 'express';
import { lookupBarcode } from '../controllers/barcodeController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/barcode/:barcode — lookup a medicine by EAN-13 barcode
// Protected: only logged-in donors can scan barcodes
router.get('/:barcode', verifyToken, lookupBarcode);

export default router;
