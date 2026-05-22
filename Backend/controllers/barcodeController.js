// controllers/barcodeController.js
// Member 2 Month 1 + Month 2 core task.
// GET /api/barcode/:barcode  — EAN-13 lookup via Open Food Facts → RxNav fallback
// POST /api/verify-barcode  — runs all 5 safety gates, returns pass/fail per gate

import axios from 'axios';
import Drug from '../models/Drug.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// Load Schedule H/H1/X blocklist from JSON file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blocklist = JSON.parse(
  readFileSync(path.join(__dirname, '../data/scheduleBlocklist.json'), 'utf-8')
);

const allBlocked = [
  ...blocklist.scheduleH,
  ...blocklist.scheduleH1,
  ...blocklist.scheduleX,
];

const getSchedule = (drugName) => {
  const n = drugName.toLowerCase();
  if (blocklist.scheduleX.some(d => n.includes(d))) return 'X';
  if (blocklist.scheduleH1.some(d => n.includes(d))) return 'H1';
  if (blocklist.scheduleH.some(d => n.includes(d))) return 'H';
  return null;
};

// ── Barcode Lookup ───────────────────────────────────────────────────────────

// GET /api/barcode/:barcode
export const lookupBarcode = async (req, res) => {
  const { barcode } = req.params;

  if (!barcode || barcode.length < 8) {
    return res.status(400).json({ success: false, message: 'Invalid barcode.' });
  }

  try {
    // Step 1: Check local MongoDB drug cache first
    const cached = await Drug.findOne({ barcode });
    if (cached) {
      return res.status(200).json({
        success: true,
        source: 'local_db',
        drug: cached,
        schedule: cached.schedule,
        isBlocked: cached.schedule !== null,
      });
    }

    // Step 2: Open Food Facts API
    let drugData = null;
    try {
      const offRes = await axios.get(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
        { timeout: 6000 }
      );
      if (offRes.data?.status === 1) {
        const p = offRes.data.product;
        drugData = {
          barcode,
          drugName: p.product_name || p.generic_name || 'Unknown',
          manufacturer: p.brands || null,
          category: p.categories_tags?.[0]?.replace('en:', '') || null,
          composition: p.ingredients_text || null,
          coldChainReq: false,
        };
      }
    } catch (e) {
      console.warn('[BarcodeController] Open Food Facts failed:', e.message);
    }

    // Step 3: RxNav fallback
    if (!drugData) {
      try {
        const rxRes = await axios.get(
          `https://rxnav.nlm.nih.gov/REST/rxcui.json?idtype=UPC&id=${barcode}`,
          { timeout: 6000 }
        );
        const rxcui = rxRes.data?.idGroup?.rxnormId?.[0];
        if (rxcui) {
          const detailRes = await axios.get(
            `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`,
            { timeout: 6000 }
          );
          const props = detailRes.data?.properties;
          if (props) {
            drugData = {
              barcode,
              drugName: props.name,
              manufacturer: null,
              category: props.tty || 'pharmaceutical',
              composition: null,
              coldChainReq: false,
            };
          }
        }
      } catch (e) {
        console.warn('[BarcodeController] RxNav fallback failed:', e.message);
      }
    }

    if (!drugData) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found. Please enter details manually.',
        barcode,
      });
    }

    // Detect schedule from drug name
    const schedule = getSchedule(drugData.drugName);
    drugData.schedule = schedule;

    // Cache in MongoDB
    const saved = await Drug.create(drugData);

    return res.status(200).json({
      success: true,
      source: 'api_lookup',
      drug: saved,
      schedule,
      isBlocked: schedule !== null,
    });
  } catch (error) {
    console.error('[BarcodeController] lookupBarcode error:', error);
    return res.status(500).json({ success: false, message: 'Barcode lookup failed.' });
  }
};

// ── 5-Gate Verification Pipeline ─────────────────────────────────────────────

// POST /api/verify-barcode
// Runs all 5 safety gates. Returns pass/fail per gate.
// Frontend shows a loading gate display (Member 1's Month 2 task).
export const verifyBarcode = async (req, res) => {
  try {
    const { drugName, category, expiryDate, originalSeal, photoUrl } = req.body;

    const gates = [];

    // Gate 1 — Drug Recognized
    gates.push({
      gate: 1,
      name: 'Drug Recognized',
      passed: Boolean(drugName && drugName.trim().length > 2),
      reason: 'Drug name must be identified from barcode or entered manually.',
    });

    // Gate 2 — Expiry 3+ months away
    const expiry = new Date(expiryDate);
    const threeMonths = new Date();
    threeMonths.setMonth(threeMonths.getMonth() + 3);
    gates.push({
      gate: 2,
      name: 'Expiry Valid (3+ months)',
      passed: !isNaN(expiry) && expiry > threeMonths,
      reason: `Medicine must expire after ${threeMonths.toDateString()}.`,
    });

    // Gate 3 — Not Schedule H/H1/X (CDSCO blocklist)
    const schedule = getSchedule(drugName || '');
    gates.push({
      gate: 3,
      name: 'Not Schedule H/H1/X',
      passed: schedule === null,
      reason: schedule
        ? `This medicine is Schedule ${schedule} and cannot be donated.`
        : 'Medicine is not a controlled substance.',
    });

    // Gate 4 — Category Classified
    gates.push({
      gate: 4,
      name: 'Category Classified',
      passed: Boolean(category && category.trim().length > 0),
      reason: 'A valid medicine category must be selected.',
    });

    // Gate 5 — Photo Proof Uploaded
    gates.push({
      gate: 5,
      name: 'Photo Proof Uploaded',
      passed: Boolean(photoUrl && photoUrl.length > 0),
      reason: 'A photo of the medicine package must be uploaded to Cloudinary.',
    });

    const allPassed = gates.every(g => g.passed);
    const failedGates = gates.filter(g => !g.passed).map(g => g.name);

    return res.status(allPassed ? 200 : 422).json({
      success: allPassed,
      allPassed,
      gates,
      failedGates,
      message: allPassed
        ? 'All 5 verification gates passed. Donation can be listed.'
        : `Failed gates: ${failedGates.join(', ')}`,
    });
  } catch (error) {
    console.error('[BarcodeController] verifyBarcode error:', error);
    return res.status(500).json({ success: false, message: 'Verification failed.' });
  }
};
