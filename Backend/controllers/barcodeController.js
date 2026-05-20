// controllers/barcodeController.js
// Handles medicine barcode lookup.
// Step 1: Hit Open Food Facts API with the EAN-13 barcode
// Step 2: If not found, fall back to RxNav for drug classification
// Step 3: Return structured drug info back to the frontend Donate.jsx form

import axios from 'axios';
import { db } from '../config/firebase.js';

// Schedule H / H1 drugs that cannot be donated — this list will be
// expanded by Member 3 into a full JSON rules file
const RESTRICTED_SCHEDULE = [
  'morphine', 'codeine', 'tramadol', 'oxycodone', 'fentanyl',
  'alprazolam', 'diazepam', 'lorazepam', 'clonazepam', 'zolpidem',
  'phenobarbital', 'methamphetamine', 'amphetamine',
  // Schedule H antibiotics (prescription only — cannot be donated without proof)
  'ciprofloxacin', 'azithromycin', 'amoxicillin-clavulanate',
];

const isRestricted = (drugName) => {
  if (!drugName) return false;
  return RESTRICTED_SCHEDULE.some(drug =>
    drugName.toLowerCase().includes(drug)
  );
};

// GET /api/barcode/:barcode
// Looks up a medicine by its EAN-13 barcode
export const lookupBarcode = async (req, res) => {
  const { barcode } = req.params;

  if (!barcode || barcode.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Invalid barcode. Must be at least 8 digits.',
    });
  }

  try {
    // ── Step 1: Check our local Firestore drug DB first (faster) ──────────
    const localSnap = await db.collection('drugs').doc(barcode).get();
    if (localSnap.exists) {
      const drug = localSnap.data();
      return res.status(200).json({
        success: true,
        source: 'local_db',
        drug: {
          ...drug,
          isRestricted: isRestricted(drug.drugName),
        },
      });
    }

    // ── Step 2: Open Food Facts API (handles Indian EAN-13 barcodes) ──────
    let drugInfo = null;
    try {
      const offResponse = await axios.get(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
        { timeout: 5000 }
      );

      if (offResponse.data.status === 1) {
        const product = offResponse.data.product;
        drugInfo = {
          barcode,
          drugName: product.product_name || product.generic_name || 'Unknown',
          manufacturer: product.brands || 'Unknown',
          category: product.categories_tags?.[0]?.replace('en:', '') || 'General',
          composition: product.ingredients_text || null,
          schedule: null,
          coldChainReq: false,
        };
      }
    } catch (offError) {
      console.warn('[BarcodeController] Open Food Facts failed:', offError.message);
    }

    // ── Step 3: RxNav fallback for pharmaceutical classification ──────────
    if (!drugInfo) {
      try {
        // RxNav works by drug name — we try a generic search using the barcode as hint
        const rxResponse = await axios.get(
          `https://rxnav.nlm.nih.gov/REST/rxcui.json?idtype=UPC&id=${barcode}`,
          { timeout: 5000 }
        );

        const rxcui = rxResponse.data?.idGroup?.rxnormId?.[0];
        if (rxcui) {
          const detailRes = await axios.get(
            `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/properties.json`,
            { timeout: 5000 }
          );
          const props = detailRes.data?.properties;
          if (props) {
            drugInfo = {
              barcode,
              drugName: props.name || 'Unknown',
              manufacturer: 'Unknown',
              category: props.tty || 'Pharmaceutical',
              composition: null,
              schedule: null,
              coldChainReq: false,
            };
          }
        }
      } catch (rxError) {
        console.warn('[BarcodeController] RxNav fallback failed:', rxError.message);
      }
    }

    // ── Step 4: Nothing found ─────────────────────────────────────────────
    if (!drugInfo) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found in any database. Please enter details manually.',
        barcode,
      });
    }

    // Cache the result in Firestore drugs collection for future lookups
    await db.collection('drugs').doc(barcode).set(drugInfo);

    return res.status(200).json({
      success: true,
      source: 'api_lookup',
      drug: {
        ...drugInfo,
        isRestricted: isRestricted(drugInfo.drugName),
      },
    });
  } catch (error) {
    console.error('[BarcodeController] lookupBarcode error:', error);
    return res.status(500).json({
      success: false,
      message: 'Barcode lookup failed. Please try again.',
    });
  }
};
