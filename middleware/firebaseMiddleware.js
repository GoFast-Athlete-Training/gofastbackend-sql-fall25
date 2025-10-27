// Firebase Auth Middleware - Verify Firebase ID tokens
import admin from '../config/firebaseAdmin.js';

/**
 * Auth Middleware - Verify Firebase ID tokens
 * Uses FIREBASE_SERVICE_ACCOUNT env variable from Render
 */
export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Attach user info to request
    req.user = {
      firebaseId: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture
    };
    
    console.log('✅ Token verified for:', decodedToken.email);
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Optional Auth - Verify token if present, but allow unauthenticated
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    req.user = {
      firebaseId: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture
    };
    
    next();
  } catch (error) {
    // Token invalid but that's ok for optional auth
    next();
  }
};

/**
 * Athlete Auth - Verify token and get athleteId
 * Requires token verification + athlete lookup
 */
export const athleteAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Get athleteId from firebaseId
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const athlete = await prisma.athlete.findFirst({
      where: { firebaseId: decodedToken.uid }
    });
    
    if (!athlete) {
      return res.status(404).json({ error: 'Athlete not found' });
    }
    
    // Attach athlete info to request
    req.user = {
      firebaseId: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
      athleteId: athlete.id
    };
    
    console.log('✅ Athlete auth verified:', athlete.id, 'for', decodedToken.email);
    next();
  } catch (error) {
    console.error('❌ Athlete auth failed:', error.message);
    res.status(401).json({ error: 'Invalid token or athlete not found' });
  }
};
