// Athlete Delete Route - Delete athlete by ID or email
// Useful for testing and cleanup
// TEMPORARY: Mock responses until Prisma is re-added

import express from 'express';

const router = express.Router();

/**
 * Delete Athlete by ID
 * DELETE /api/athlete/:id
 * TEMPORARY: Returns mock success until Prisma is re-added
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ DELETE: Attempting to delete athlete:', id);
    console.log('⚠️ TEMPORARY: Using mock response until Prisma is re-added');

    // Mock successful deletion
    res.json({
      success: true,
      message: 'Athlete deleted successfully (mock)',
      deletedAthlete: {
        id: id,
        email: 'mock@example.com',
        firstName: 'Mock',
        lastName: 'User'
      }
    });

  } catch (error) {
    console.error('❌ DELETE: Error deleting athlete:', error);
    res.status(500).json({ 
      error: 'Failed to delete athlete',
      details: error.message 
    });
  }
});

/**
 * Delete Athlete by Email
 * DELETE /api/athlete/email/:email
 * TEMPORARY: Returns mock success until Prisma is re-added
 */
router.delete('/email/:email', async (req, res) => {
  try {
    const { email } = req.params;

    console.log('🗑️ DELETE: Attempting to delete athlete by email:', email);
    console.log('⚠️ TEMPORARY: Using mock response until Prisma is re-added');

    // Mock successful deletion
    res.json({
      success: true,
      message: 'Athlete deleted successfully (mock)',
      deletedAthlete: {
        id: 'mock-id',
        email: email,
        firstName: 'Mock',
        lastName: 'User'
      }
    });

  } catch (error) {
    console.error('❌ DELETE: Error deleting athlete by email:', error);
    res.status(500).json({ 
      error: 'Failed to delete athlete',
      details: error.message 
    });
  }
});

/**
 * Delete Athlete by Firebase ID
 * DELETE /api/athlete/firebase/:firebaseId
 * TEMPORARY: Returns mock success until Prisma is re-added
 */
router.delete('/firebase/:firebaseId', async (req, res) => {
  try {
    const { firebaseId } = req.params;

    console.log('🗑️ DELETE: Attempting to delete athlete by firebaseId:', firebaseId);
    console.log('⚠️ TEMPORARY: Using mock response until Prisma is re-added');

    // Mock successful deletion
    res.json({
      success: true,
      message: 'Athlete deleted successfully (mock)',
      deletedAthlete: {
        id: 'mock-id',
        email: 'mock@example.com',
        firstName: 'Mock',
        lastName: 'User',
        firebaseId: firebaseId
      }
    });

  } catch (error) {
    console.error('❌ DELETE: Error deleting athlete by firebaseId:', error);
    res.status(500).json({ 
      error: 'Failed to delete athlete',
      details: error.message 
    });
  }
});

/**
 * Bulk Delete Athletes
 * DELETE /api/athlete/bulk
 * Body: { ids: ['id1', 'id2', 'id3'] }
 * TEMPORARY: Returns mock success until Prisma is re-added
 */
router.delete('/bulk', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request. Provide an array of athlete IDs in the body: { ids: ["id1", "id2"] }' 
      });
    }

    console.log('🗑️ BULK DELETE: Attempting to delete athletes:', ids);
    console.log('⚠️ TEMPORARY: Using mock response until Prisma is re-added');

    // Mock successful bulk deletion
    const mockDeletedAthletes = ids.map(id => ({
      id: id,
      email: 'mock@example.com',
      firstName: 'Mock',
      lastName: 'User'
    }));

    res.json({
      success: true,
      message: `${ids.length} athletes deleted successfully (mock)`,
      deletedAthletes: mockDeletedAthletes,
      requestedCount: ids.length,
      deletedCount: ids.length
    });

  } catch (error) {
    console.error('❌ BULK DELETE: Error deleting athletes:', error);
    res.status(500).json({ 
      error: 'Failed to delete athletes',
      details: error.message 
    });
  }
});

export default router;
