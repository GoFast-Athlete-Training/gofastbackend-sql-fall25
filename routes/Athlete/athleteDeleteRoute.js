// Athlete Delete Route - Delete athlete by ID or email
// Useful for testing and cleanup

import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Delete Athlete by ID
 * DELETE /api/athlete/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ DELETE: Attempting to delete athlete:', id);

    // Check if athlete exists
    const athlete = await prisma.athlete.findUnique({
      where: { id }
    });

    if (!athlete) {
      console.log('❌ DELETE: Athlete not found:', id);
      return res.status(404).json({ 
        error: 'Athlete not found',
        id: id
      });
    }

    // Delete the athlete
    await prisma.athlete.delete({
      where: { id }
    });

    console.log('✅ DELETE: Athlete deleted successfully:', id);

    res.json({
      success: true,
      message: 'Athlete deleted successfully',
      deletedAthlete: {
        id: athlete.id,
        email: athlete.email,
        firstName: athlete.firstName,
        lastName: athlete.lastName
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
 */
router.delete('/email/:email', async (req, res) => {
  try {
    const { email } = req.params;

    console.log('🗑️ DELETE: Attempting to delete athlete by email:', email);

    // Check if athlete exists
    const athlete = await prisma.athlete.findUnique({
      where: { email }
    });

    if (!athlete) {
      console.log('❌ DELETE: Athlete not found with email:', email);
      return res.status(404).json({ 
        error: 'Athlete not found',
        email: email
      });
    }

    // Delete the athlete
    await prisma.athlete.delete({
      where: { email }
    });

    console.log('✅ DELETE: Athlete deleted successfully by email:', email);

    res.json({
      success: true,
      message: 'Athlete deleted successfully',
      deletedAthlete: {
        id: athlete.id,
        email: athlete.email,
        firstName: athlete.firstName,
        lastName: athlete.lastName
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
 */
router.delete('/firebase/:firebaseId', async (req, res) => {
  try {
    const { firebaseId } = req.params;

    console.log('🗑️ DELETE: Attempting to delete athlete by firebaseId:', firebaseId);

    // Check if athlete exists
    const athlete = await prisma.athlete.findUnique({
      where: { firebaseId }
    });

    if (!athlete) {
      console.log('❌ DELETE: Athlete not found with firebaseId:', firebaseId);
      return res.status(404).json({ 
        error: 'Athlete not found',
        firebaseId: firebaseId
      });
    }

    // Delete the athlete
    await prisma.athlete.delete({
      where: { firebaseId }
    });

    console.log('✅ DELETE: Athlete deleted successfully by firebaseId:', firebaseId);

    res.json({
      success: true,
      message: 'Athlete deleted successfully',
      deletedAthlete: {
        id: athlete.id,
        email: athlete.email,
        firstName: athlete.firstName,
        lastName: athlete.lastName,
        firebaseId: athlete.firebaseId
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

    // Check which athletes exist
    const existingAthletes = await prisma.athlete.findMany({
      where: { id: { in: ids } },
      select: { id: true, email: true, firstName: true, lastName: true }
    });

    if (existingAthletes.length === 0) {
      console.log('❌ BULK DELETE: No athletes found with provided IDs');
      return res.status(404).json({ 
        error: 'No athletes found with provided IDs',
        requestedIds: ids
      });
    }

    // Delete the athletes
    await prisma.athlete.deleteMany({
      where: { id: { in: ids } }
    });

    console.log('✅ BULK DELETE: Athletes deleted successfully:', existingAthletes.length);

    res.json({
      success: true,
      message: `${existingAthletes.length} athletes deleted successfully`,
      deletedAthletes: existingAthletes,
      requestedCount: ids.length,
      deletedCount: existingAthletes.length
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
