// models/Drug.js
import mongoose from 'mongoose';

const drugSchema = new mongoose.Schema(
  {
    // Made barcode optional and sparse because master regulatory list documents 
    // from CDSCO do not come with retail unit commercial barcodes pre-assigned.
    barcode: { type: String, unique: true, sparse: true }, 
    
    drugName: { type: String, required: true },
    
    manufacturer: { type: String, default: null },
    
    category: { type: String, default: null },
    
    // Expanded the enum array to natively allow full string definitions from the JSON list
    schedule: { 
      type: String, 
      enum: ['H', 'H1', 'X', 'Schedule H', 'Schedule H1', 'Schedule X', null], 
      default: null 
    },
    
    coldChainReq: { type: Boolean, default: false },
    
    composition: { type: String, default: null },
  },
  { timestamps: true }
);

// ⚡ 1. Enforce a high-speed text search indexing layer over the drugName field natively
drugSchema.index({ drugName: 'text' });

// ⚡ 2. The 3rd argument forces Mongoose to map directly to your 'cdsco_blocklist' collection
export default mongoose.model('Drug', drugSchema, 'cdsco_blocklist');