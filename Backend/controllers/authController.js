// controllers/authController.js
// Handles user registration (sets custom role claim) and profile fetch.
// Login itself happens on the frontend via Firebase Auth SDK —
// we only need the backend for setting the role custom claim.

import { auth, db } from '../config/firebase.js';

// POST /api/auth/register
// Called after frontend Firebase signup to store user profile + set role claim
export const registerUser = async (req, res) => {
  try {
    const { uid, fullName, email, role, pincode, darpanId } = req.body;

    // Validate role
    const validRoles = ['donor', 'ngo', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      });
    }

    // Set custom claim on Firebase Auth token (used in verifyToken middleware)
    await auth.setCustomUserClaims(uid, { role });

    // Build the Firestore user document
    const userDoc = {
      uid,
      fullName,
      email,
      role,
      pincode: pincode || null,
      totalDonations: 0,
      createdAt: new Date().toISOString(),
    };

    // Save to /users collection
    await db.collection('users').doc(uid).set(userDoc);

    // If the user is an NGO, also create an NGO document (for Member 3's schema)
    if (role === 'ngo') {
      await db.collection('ngos').doc(uid).set({
        ngoId: uid,
        name: fullName,
        email,
        darpanId: darpanId || null,
        verified: false, // Admin must verify
        location: null,
        geoHash: null,
        wishlist: [],
        coldChain: false,
        reliabilityScore: 0,
        pickupsCompleted: 0,
        fcmToken: null,
        phone: null,
        createdAt: new Date().toISOString(),
      });
    }

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      user: userDoc,
    });
  } catch (error) {
    console.error('[AuthController] registerUser error:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: error.message,
    });
  }
};

// GET /api/auth/me  (protected)
// Returns the logged-in user's profile from Firestore
export const getMyProfile = async (req, res) => {
  try {
    const userSnap = await db.collection('users').doc(req.user.uid).get();

    if (!userSnap.exists) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      user: userSnap.data(),
    });
  } catch (error) {
    console.error('[AuthController] getMyProfile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch profile.' });
  }
};

// POST /api/auth/fcm-token  (protected)
// Saves the device FCM push token to the user/NGO document
export const saveFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const { uid, role } = req.user;

    if (!fcmToken) {
      return res.status(400).json({ success: false, message: 'fcmToken is required.' });
    }

    await db.collection('users').doc(uid).update({ fcmToken });

    // Also update in ngos collection if the user is an NGO
    if (role === 'ngo') {
      await db.collection('ngos').doc(uid).update({ fcmToken });
    }

    return res.status(200).json({ success: true, message: 'FCM token saved.' });
  } catch (error) {
    console.error('[AuthController] saveFcmToken error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save FCM token.' });
  }
};
