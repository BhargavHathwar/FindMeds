// models/NGO.js
import mongoose from 'mongoose';

const ngoSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true, trim: true },
    darpanId: { type: String, unique: true, sparse: true },
    verified: { type: Boolean, default: false },
    // GeoJSON Point — required for $nearSphere queries
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    wishlist: { type: [String], default: [] }, // e.g. ['antibiotics', 'diabetes']
    coldChain: { type: Boolean, default: false },
    reliabilityScore: { type: Number, default: 0.75, min: 0, max: 1 },
    pickupsCompleted: { type: Number, default: 0 },
    phone: { type: String, default: null },
    email: { type: String, required: true },
    fcmToken: { type: String, default: null },
    verifiedAt: { type: Date, default: null },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

// 2dsphere index — enables MongoDB $nearSphere geo radius queries
ngoSchema.index({ location: '2dsphere' });

export default mongoose.model('NGO', ngoSchema);
