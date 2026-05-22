// config/cronJobs.js
// Runs every hour. Finds donations unclaimed for 24+ hours and auto-expires them.
// This is Member 2's Month 3 task: node-cron auto-cascade job.

import cron from 'node-cron';
import Donation from '../models/Donation.js';
import AuditLog from '../models/AuditLog.js';

export const startCronJobs = () => {
  // Every hour on the dot
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Running 24h unclaimed donation check...');
    try {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const expired = await Donation.updateMany(
        { status: 'available', createdAt: { $lt: cutoff } },
        { $set: { status: 'auto_expired' } }
      );

      if (expired.modifiedCount > 0) {
        await AuditLog.create({
          action: 'auto_expired',
          actorId: null,
          notes: `${expired.modifiedCount} donations auto-expired by cron after 24h.`,
        });
        console.log(`[CRON] Auto-expired ${expired.modifiedCount} donations.`);
      } else {
        console.log('[CRON] No donations to expire.');
      }
    } catch (err) {
      console.error('[CRON] Error:', err.message);
    }
  });

  console.log('[CRON] Scheduled jobs started.');
};
