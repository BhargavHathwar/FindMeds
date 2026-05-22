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
    // GeoJSON Point — enables $nearSphere matching
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    coldChain: { type: Boolean, default: false },
    originalSeal: { type: Boolean, default: false },
    noWaterDamage: { type: Boolean, default: false },
    sterilePackaging: { type: Boolean, default: false },
    description: { type: String, default: null },
    status: {
      type: String,
      enum: ['available', 'claimed', 'cancelled', 'auto_expired'],
      default: 'available',
    },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', default: null },
    claimedAt: { type: Date, default: null },
    notifiedAt: { type: Date, default: null },
    gates: { type: Array, default: [] }, // stores 5-gate verification results
  },
  { timestamps: true }
);

// Indexes for fast queries
donationSchema.index({ location: '2dsphere' });
donationSchema.index({ status: 1 });
donationSchema.index({ donorId: 1 });

export default mongoose.model('Donation', donationSchema);
