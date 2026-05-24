// models/Donation.js
import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
  {
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    drugName: { type: String, required: true, trim: true },
    barcode: { type: String, default: null },
    category: { type: String, required: true },
    manufacturer: { type: String, default: null },
    batchNumber: { type: String, default: null },
    expiryDate: { type: Date, required: true },
    quantity: { type: Number, required: true, min: 1 },
    quantityUnit: { type: String, default: 'Units' },
    photoUrl: { type: String, default: null },
    pincode: { type: String, default: null },
    
    // GeoJSON Point — enables high-speed $geoNear or $nearSphere matching queries
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },
    
    coldChain: { type: Boolean, default: false },
    originalSeal: { type: Boolean, default: false },
    noWaterDamage: { type: Boolean, default: false },
    sterilePackaging: { type: Boolean, default: false },
    description: { type: String, default: null },
    
    status: {
      type: String,
      // Expanded the enum array pool to safely include 'expired' matching fields
      enum: ['available', 'claimed', 'cancelled', 'auto_expired', 'expired'],
      default: 'available',
    },
    
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', default: null },
    claimedAt: { type: Date, default: null },
    notifiedAt: { type: Date, default: null },
    gates: { type: Array, default: [] }, // stores 5-gate verification results
  },
  { timestamps: true }
);

// ==============================================================================
// 🏷️ CLOUD PERFORMANCE INDEX RULES
// ==============================================================================
// Enables high-performance native spatial processing algorithms
donationSchema.index({ location: '2dsphere' });
donationSchema.index({ status: 1 });
donationSchema.index({ donorId: 1 });

// Compiles a compound text search layer over drugName for high-speed custom dashboard filtering
donationSchema.index({ drugName: 'text' });

export default mongoose.model('Donation', donationSchema);