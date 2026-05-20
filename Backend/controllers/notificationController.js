// controllers/notificationController.js
// Sends FCM push notifications to NGO dashboards and Twilio SMS as fallback.
// Called after a donation is listed and NGO matches are found.

import { messaging, db } from '../config/firebase.js';
import twilio from 'twilio';

// Lazy-init Twilio (only if credentials exist — avoids crash in dev without credentials)
const getTwilioClient = () => {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return null;
  return twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
};

// POST /api/notifications/notify-ngos
// Sends notifications to matched NGOs about a new available donation
export const notifyMatchedNGOs = async (req, res) => {
  try {
    const { donationId, ngoMatches } = req.body;
    // ngoMatches = array of { ngoId, name, fcmToken, phone }

    if (!donationId || !Array.isArray(ngoMatches) || ngoMatches.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'donationId and ngoMatches array are required.',
      });
    }

    const donationSnap = await db.collection('donations').doc(donationId).get();
    if (!donationSnap.exists) {
      return res.status(404).json({ success: false, message: 'Donation not found.' });
    }

    const donation = donationSnap.data();
    const results = { fcm: [], sms: [], errors: [] };

    for (const ngo of ngoMatches) {
      // ── FCM Push Notification ─────────────────────────────────────────
      if (ngo.fcmToken) {
        try {
          await messaging.send({
            token: ngo.fcmToken,
            notification: {
              title: '🏥 New Donation Match — FindMeds',
              body: `${donation.drugName} (${donation.quantity} ${donation.quantityUnit}) is available near you!`,
            },
            data: {
              type: 'new_donation',
              donationId,
              drugName: donation.drugName,
              category: donation.category,
            },
            android: { priority: 'high' },
            apns: { payload: { aps: { sound: 'default', badge: 1 } } },
          });
          results.fcm.push({ ngoId: ngo.ngoId, status: 'sent' });
        } catch (fcmErr) {
          console.warn(`[NotificationController] FCM failed for NGO ${ngo.ngoId}:`, fcmErr.message);
          results.errors.push({ ngoId: ngo.ngoId, type: 'fcm', error: fcmErr.message });
        }
      }

      // ── Twilio SMS Fallback (for NGOs without internet/app) ───────────
      if (ngo.phone) {
        const client = getTwilioClient();
        if (client) {
          try {
            await client.messages.create({
              body: `FindMeds Alert: New donation available — ${donation.drugName} (${donation.quantity} ${donation.quantityUnit}). Log in to findmeds.vercel.app to claim.`,
              from: process.env.TWILIO_PHONE_NUMBER,
              to: ngo.phone,
            });
            results.sms.push({ ngoId: ngo.ngoId, status: 'sent' });
          } catch (smsErr) {
            console.warn(`[NotificationController] SMS failed for NGO ${ngo.ngoId}:`, smsErr.message);
            results.errors.push({ ngoId: ngo.ngoId, type: 'sms', error: smsErr.message });
          }
        }
      }
    }

    // Log notification event
    await db.collection('audit_logs').add({
      donationId,
      action: 'notified',
      actorUid: 'system',
      timestamp: new Date().toISOString(),
      notes: `Notified ${results.fcm.length} via FCM, ${results.sms.length} via SMS.`,
    });

    return res.status(200).json({
      success: true,
      message: 'Notifications dispatched.',
      results,
    });
  } catch (error) {
    console.error('[NotificationController] notifyMatchedNGOs error:', error);
    return res.status(500).json({ success: false, message: 'Notification dispatch failed.', error: error.message });
  }
};
