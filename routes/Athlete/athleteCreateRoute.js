// Athlete Create Route - Create or find athlete from Firebase data
// Athlete-first architecture - firebaseId links to athleteId
// TEMPORARY: Mock responses until Prisma is re-added

import express from 'express';

const router = express.Router();

/**
 * Create or Find Athlete from Firebase data
 * Called after Firebase sign-in to create/find athlete record
 * Links Firebase user to GoFast athlete
 * TEMPORARY: Returns mock data until Prisma is re-added
 */
router.post('/athleteuser', async (req, res) => {
  try {
    const { firebaseId, email, firstName, lastName, photoURL } = req.body;
    
    console.log('🔐 AUTH: FindOrCreate for firebaseId:', firebaseId);
    console.log('⚠️ TEMPORARY: Using mock response until Prisma is re-added');
    
    // Mock athlete response
    const mockAthlete = {
      id: 'mock-athlete-' + Date.now(),
      firebaseId: firebaseId,
      email: email,
      firstName: firstName || 'Mock',
      lastName: lastName || 'User',
      gofastHandle: null,
      birthday: null,
      gender: null,
      city: null,
      state: null,
      primarySport: null,
      photoURL: photoURL || null,
      bio: null,
      instagram: null
    };
    
    console.log('✅ AUTH: Mock Athlete created:', mockAthlete.id);
    
    res.status(201).json(mockAthlete);
    
  } catch (error) {
    console.error('❌ AUTH: FindOrCreate error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
