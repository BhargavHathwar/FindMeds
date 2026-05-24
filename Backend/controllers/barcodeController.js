// controllers/barcodeController.js
// Optimized Data/DevOps Edition — Integrates Live Atlas Text Queries and Cold Chain Matrix

import axios from 'axios';
import Drug from '../models/Drug.js';

/**
 * 🛡️ Helper: Connects directly with your seeded MongoDB collection to see if 
 * a medication is registered as a controlled substance under CDSCO guidelines.
 */
const lookupCDSCOBlocklist = async (drugName) => {
  if (!drugName || drugName.trim().length === 0) return null;
  
  try {
    // Uses the text index you built in your Drug schema to run a high-speed search
    const matchedDrug = await Drug.findOne(
      { $text: { $search: drugName } },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });

    // Verify if the top score represents a valid restricted schedule hit
    if (matchedDrug && ['H', 'H1', 'X', 'Schedule H', 'Schedule H1', 'Schedule X'].includes(matchedDrug.schedule)) {
      return matchedDrug.schedule;
    }
    return null;
  } catch (error) {
    console.error('[DATABASE ERROR] Blocklist text lookup failed:', error.message);
    return null;
  }
};

// ── Barcode Lookup ───────────────────────────────────────────────────────────

// GET /api/barcode/:barcode
export const lookupBarcode = async (req, res) => {
  const { barcode } = req.params;

  if (!barcode || barcode.length < 8) {
    return res.status(400).json({ success: false, message: 'Invalid barcode structure.' });
  }

  try {
    // Step 1: Check local MongoDB cache pool first
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

    // Step 2: Query Global Open Food Facts Engine API
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
          drugName: p.product_name || p.generic_name || 'Unknown Medicine',
          manufacturer: p.brands || null,
          category: p.categories_tags?.[0]?.replace('en:', '') || 'pharmaceutical',
          composition: p.ingredients_text || null,
          coldChainReq: false,
        };
      }
    } catch (e) {
      console.warn('[BarcodeController] Open Food Facts network trace dropped:', e.message);
    }

    // Step 3: RxNav clinical backup registry fallback query
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
        console.warn('[BarcodeController] RxNav registry mirror unreachable:', e.message);
      }
    }

    if (!drugData) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not recognized in master registries. Please enter properties manually.',
        barcode,
      });
    }

    // ── AUTOMATED COLD-CHAIN IDENTIFICATION FILTER ──────────────────
    const normalizedName = drugData.drugName.toLowerCase();
    const normalizedCategory = drugData.category.toLowerCase();
    if (
      normalizedName.includes('insulin') || 
      normalizedName.includes('vaccine') || 
      normalizedCategory.includes('insulin') ||
      normalizedCategory.includes('cold')
    ) {
      drugData.coldChainReq = true;
      console.log(`[COLD-CHAIN FLAG] Auto-detected temperature regulation required for: ${drugData.drugName}`);
    }

    // Detect schedule parameters directly from your live seeded MongoDB collection
    const detectedSchedule = await lookupCDSCOBlocklist(drugData.drugName);
    drugData.schedule = detectedSchedule;

    // Persist to local MongoDB cache pool
    const saved = await Drug.create(drugData);

    return res.status(200).json({
      success: true,
      source: 'api_lookup',
      drug: saved,
      schedule: detectedSchedule,
      isBlocked: detectedSchedule !== null,
    });
  } catch (error) {
    console.error('[BarcodeController] lookupBarcode critical error:', error);
    return res.status(500).json({ success: false, message: 'Barcode resolution processing failure.' });
  }
};

// ── 5-Gate Verification Pipeline ─────────────────────────────────────────────

// POST /api/verify-barcode
export const verifyBarcode = async (req, res) => {
  try {
    const { drugName, category, expiryDate, photoUrl } = req.body;
    const gates = [];

    // Gate 1 — Drug Recognized
    gates.push({
      gate: 1,
      name: 'Drug Recognized',
      passed: Boolean(drugName && drugName.trim().length > 2),
      reason: 'Drug name must be resolved through a barcode sweep or entered manually.',
    });

    // Gate 2 — Expiry 3+ months away
    const expiry = new Date(expiryDate);
    const threeMonthsOut = new Date();
    threeMonthsOut.setMonth(threeMonthsOut.getMonth() + 3);
    gates.push({
      gate: 2,
      name: 'Expiry Valid (3+ months)',
      passed: !isNaN(expiry) && expiry > threeMonthsOut,
      reason: `Medicine safety index constraints require expiry dates past ${threeMonthsOut.toDateString()}.`,
    });

    // Gate 3 — Not Schedule H/H1/X (Live CDSCO cloud database verification)
    const activeSchedule = await lookupCDSCOBlocklist(drugName || '');
    gates.push({
      gate: 3,
      name: 'Not Controlled Substance',
      passed: activeSchedule === null,
      reason: activeSchedule
        ? `CDSCO Restriction: This formulation is cataloged as Schedule ${activeSchedule} and cannot be redistributed.`
        : 'Formulation successfully cleared through controlled substances screening parameters.',
    });

    // Gate 4 — Category Classified
    gates.push({
      gate: 4,
      name: 'Category Classified',
      passed: Boolean(category && category.trim().length > 0),
      reason: 'A specific medical classification tier parameter must be selected.',
    });

    // Gate 5 — Photo Proof Uploaded
    gates.push({
      gate: 5,
      name: 'Photo Proof Uploaded',
      passed: Boolean(photoUrl && photoUrl.length > 0),
      reason: 'An active visual verification asset stream link from Cloudinary must be provided.',
    });

    const allPassed = gates.every(g => g.passed);
    const failedGates = gates.filter(g => !g.passed).map(g => g.name);

    return res.status(allPassed ? 200 : 422).json({
      success: allPassed,
      allPassed,
      gates,
      failedGates,
      message: allPassed
        ? 'All 5 verification gates passed. Medication authorized for listing distribution.'
        : `Listing suspended. Unmet safety gates: ${failedGates.join(', ')}`,
    });
  } catch (error) {
    console.error('[BarcodeController] verifyBarcode system failure:', error);
    return res.status(500).json({ success: false, message: 'Data gate validation pipeline crashed.' });
  }
};