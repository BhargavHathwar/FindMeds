// config/cronJobs.js
// Runs every hour. 
// 1. Pipeline A: Finds donations physically past their shelf-life and marks them 'expired'.
// 2. Pipeline B: Finds donations unclaimed for 24+ hours and marks them 'auto_expired'.

import cron from 'node-cron';
import Donation from '../models/Donation.js';

export const startCronJobs = () => {
  // Scheduled to execute every hour on the dot (e.g., 1:00, 2:00, etc.)
  cron.schedule('0 * * * *', async () => {
    console.log('\n[CRON] ⏰ Triggering background automated data synchronization sweeps...');
    const now = new Date();

    try {
      // ==============================================================================
      // 💊 PIPELINE A: PHYSICAL MEDICATION SHELF-LIFE EXPIRY CHECK
      // ==============================================================================
      // Scans for medicines whose expiry date has passed today, regardless of creation time.
      const physicalExpiryResult = await Donation.updateMany(
        { 
          status: { $in: ['available', 'pending'] }, 
          expiryDate: { $lte: now } 
        },
        { $set: { status: 'expired' } }
      );

      if (physicalExpiryResult.modifiedCount > 0) {
        console.log(`[CRON] ⚠️ Alert: Automatically marked ${physicalExpiryResult.modifiedCount} physically expired medicines as 'expired'.`);
      }


      // ==============================================================================
      // ⏳ PIPELINE B: 24-HOUR REGULATORY LISTING TIMEOUT (Auto-Cascade)
      // ==============================================================================
      // Resolves the 24-hour listing availability window for unclaimed donations.
      const reservationCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const claimTimeoutResult = await Donation.updateMany(
        { 
          status: 'available', 
          createdAt: { $lt: reservationCutoff } 
        },
        { $set: { status: 'auto_expired' } }
      );

      if (claimTimeoutResult.modifiedCount > 0) {
        console.log(`[CRON] 📉 Cascade: Auto-expired ${claimTimeoutResult.modifiedCount} unclaimed listings past the 24h request window.`);
        
        // Safe Fallback Log to protect against missing AuditLog database schemas
        try {
          // If your team defines a structural models/AuditLog.js later, uncomment this block:
          // await AuditLog.create({
          //   action: 'auto_expired',
          //   actorId: null,
          //   notes: `${claimTimeoutResult.modifiedCount} listings closed automatically via cron schedule.`,
          // });
        } catch (logErr) {
          console.error('[CRON] Non-blocking AuditLog writing warning:', logErr.message);
        }
      }

      if (physicalExpiryResult.modifiedCount === 0 && claimTimeoutResult.modifiedCount === 0) {
        console.log('[CRON] ✅ Clean execution. All cloud donation collection vectors are current.');
      }

    } catch (err) {
      console.error('❌ [CRON CRITICAL ERROR] Background data processing pipeline interrupted:', err.message);
    }
  });

  console.log('[CRON] Automated Background Task Engine Activated successfully.');
};