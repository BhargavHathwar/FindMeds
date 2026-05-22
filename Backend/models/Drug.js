// models/Drug.js
import mongoose from 'mongoose';

const drugSchema = new mongoose.Schema(
  {
    barcode: { type: String, required: true, unique: true },
    drugName: { type: String, required: true },
    manufacturer: { type: String, default: null },
    category: { type: String, default: null },
    schedule: { type: String, enum: ['H', 'H1', 'X', null], default: null },
    coldChainReq: { type: Boolean, default: false },
    composition: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Drug', drugSchema);
