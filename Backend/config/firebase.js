// config/firebase.js
// Initializes Firebase Admin SDK — used by all routes

import admin from 'firebase-admin';

// Firebase Admin is initialized once and reused across the app
// Credentials come from environment variables (never hardcoded)

const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // The \n in the env file must be replaced with actual newlines
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();
export const messaging = admin.messaging();

export default app;
