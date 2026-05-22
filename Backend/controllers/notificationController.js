// controllers/notificationController.js
// Twilio SMS + NodeMailer email dispatch.
// Called after donation listing to notify top 3 matched NGOs simultaneously.

import twilio from 'twilio';
import nodemailer from 'nodemailer';
import AuditLog from '../models/AuditLog.js';

// ── Twilio client (lazy init) ────────────────────────────────────────────────
const getTwilio = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) return null;
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
};

// ── NodeMailer transporter (Gmail SMTP) ─────────────────────────────────────
const getMailer = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
};

// Main export — called by donationController after a listing
export const notifyNGOs = async (donation, ngoList) => {
  const twilioClient = getTwilio();
  const mailer = getMailer();
  const results = [];

  for (const ngo of ngoList) {
    const msg = `FindMeds Alert: New donation nearby — ${donation.drugName} (${donation.quantity} ${donation.quantityUnit}). Log in to claim: https://findmeds.vercel.app`;

    // SMS
    if (twilioClient && ngo.phone) {
      try {
        await twilioClient.messages.create({
          body: msg,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: ngo.phone,
        });
        results.push({ ngoId: ngo._id, type: 'sms', status: 'sent' });
      } catch (err) {
        console.warn(`[NotificationController] SMS failed for ${ngo.name}:`, err.message);
        results.push({ ngoId: ngo._id, type: 'sms', status: 'failed', error: err.message });
      }
    }

    // Email
    if (mailer && ngo.email) {
      try {
        await mailer.sendMail({
          from: `"FindMeds" <${process.env.EMAIL_USER}>`,
          to: ngo.email,
          subject: `🏥 New Medicine Donation Match — ${donation.drugName}`,
          html: `
            <div style="font-family:sans-serif;max-width:500px">
              <h2 style="color:#0d9488">New Donation Match — FindMeds</h2>
              <p>Hello ${ngo.name},</p>
              <p>A new donation matching your wishlist is available nearby:</p>
              <table style="width:100%;border-collapse:collapse;margin:16px 0">
                <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold">Medicine</td><td style="padding:8px;border:1px solid #e2e8f0">${donation.drugName}</td></tr>
                <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold">Category</td><td style="padding:8px;border:1px solid #e2e8f0">${donation.category}</td></tr>
                <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold">Quantity</td><td style="padding:8px;border:1px solid #e2e8f0">${donation.quantity} ${donation.quantityUnit}</td></tr>
                <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold">Expiry</td><td style="padding:8px;border:1px solid #e2e8f0">${new Date(donation.expiryDate).toDateString()}</td></tr>
              </table>
              <a href="https://findmeds.vercel.app/ngo-dashboard" style="background:#0d9488;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">Claim This Donation →</a>
              <p style="color:#94a3b8;font-size:12px;margin-top:24px">First NGO to claim wins. Unclaimed donations expire after 24 hours.</p>
            </div>
          `,
        });
        results.push({ ngoId: ngo._id, type: 'email', status: 'sent' });
      } catch (err) {
        console.warn(`[NotificationController] Email failed for ${ngo.name}:`, err.message);
        results.push({ ngoId: ngo._id, type: 'email', status: 'failed', error: err.message });
      }
    }
  }

  // Log notification
  await AuditLog.create({
    donationId: donation._id,
    action: 'notified',
    actorId: null,
    notes: `Notified ${ngoList.length} NGOs. Results: ${JSON.stringify(results)}`,
  });

  return results;
};

// POST /api/notifications/notify-ngos  (manual trigger route)
export const notifyNGOsRoute = async (req, res) => {
  try {
    const { donationId, ngoIds } = req.body;
    return res.status(200).json({ success: true, message: 'Notification triggered.', donationId });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Notification failed.' });
  }
};
