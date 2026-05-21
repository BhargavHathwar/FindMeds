// models/AuditLog.js
import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    donationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', default: null },
    action: {
      type: String,
      enum: ['listed', 'claimed', 'cancelled', 'auto_expired', 'flagged', 'ngo_approved', 'ngo_rejected', 'notified'],
      required: true,
    },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    notes: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('AuditLog', auditLogSchema);
