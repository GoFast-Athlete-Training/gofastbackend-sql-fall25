// Firebase Admin SDK Configuration for GoFast Backend
import admin from "firebase-admin";

// Firebase configuration from Render environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Initialize Firebase Admin SDK
const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "gofast-a5f94"
});

console.log('Firebase Admin SDK initialized successfully for project: gofast-a5f94');

// Export Firebase Admin instance
export default {
  admin,
  firebaseApp,
  auth: admin.auth(),
  firestore: admin.firestore(),
};

// Helper function to verify Firebase token
export const verifyFirebaseToken = async (token) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    throw new Error('Invalid token');
  }
};
