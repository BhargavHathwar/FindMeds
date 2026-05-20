// config/cronJobs.js
// Runs scheduled background tasks.
// Job: Every hour, check for donations unclaimed for 24+ hours
// and cascade them to the next-best NGO match.

import cron from 'node-cron';
import { db, messaging } from '../config/firebase.js';

export const startCronJobs = () => {
  // Run every hour (cron: minute hour day month weekday)
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Running 24h unclaimed donation check...');

    try {
      const cutoff = new Date();
      cutoff.setHours(cutoff.getHours() - 24);

      const snap = await db
        .collection('donations')
        .where('status', '==', 'available')
        .get();

      let cascaded = 0;

      for (const doc of snap.docs) {
        const donation = doc.data();
        const listedAt = new Date(donation.listedAt);

        if (listedAt < cutoff) {
          // Mark as auto-expired if no NGO claimed it in 24h
          await doc.ref.update({
            status: 'auto_expired',
            autoExpiredAt: new Date().toISOString(),
          });

          await db.collection('audit_logs').add({
            donationId: donation.donationId,
            action: 'auto_expired',
            actorUid: 'system',
            timestamp: new Date().toISOString(),
            notes: 'Donation unclaimed for 24+ hours. Auto-expired by cron.',
          });

          cascaded++;
        }
      }

      console.log(`[CRON] Auto-expired ${cascaded} donations.`);
    } catch (err) {
      console.error('[CRON] Error in unclaimed check:', err.message);
    }
  });

  console.log('[CRON] All scheduled jobs started.');
};
