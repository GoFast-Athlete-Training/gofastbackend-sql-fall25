// Firebase Admin SDK Configuration for Backend
const admin = require('firebase-admin');

// Firebase configuration from environment variables
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || "gofast-a5f94",
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

// Initialize Firebase Admin SDK
let firebaseApp;
try {
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    projectId: firebaseConfig.projectId,
  });
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  throw error;
}

// Export Firebase Admin instance
module.exports = {
  admin,
  firebaseApp,
  auth: admin.auth(),
  firestore: admin.firestore(),
};

// Helper function to verify Firebase token
const verifyFirebaseToken = async (token) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    throw new Error('Invalid token');
  }
};

module.exports.verifyFirebaseToken = verifyFirebaseToken;
