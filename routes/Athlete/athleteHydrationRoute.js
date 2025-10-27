// Athlete Hydration Route - Get all athletes from Render backend
// Calls https://gofastbackend-sql-fall25.onrender.com/api/athletes

import express from 'express';
import axios from 'axios';

const router = express.Router();

/**
 * Get All Athletes from Render Backend
 * GET /api/athlete-hydration
 */
router.get('/athlete-hydration', async (req, res) => {
  try {
    console.log('🔄 HYDRATION: Fetching all athletes from Render backend...');

    // Call the Render backend
    const response = await axios.get('https://gofastbackend-sql-fall25.onrender.com/api/athletes', {
      timeout: 10000, // 10 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ HYDRATION: Successfully fetched athletes from Render');
    console.log('📊 HYDRATION: Received', response.data.length, 'athletes');

    res.json({
      success: true,
      message: `Successfully hydrated ${response.data.length} athletes from Render backend`,
      count: response.data.length,
      athletes: response.data,
      source: 'https://gofastbackend-sql-fall25.onrender.com/api/athletes'
    });

  } catch (error) {
    console.error('❌ HYDRATION: Error fetching athletes from Render:', error.message);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      res.status(503).json({
        success: false,
        error: 'Render backend is not accessible',
        message: 'Cannot connect to https://gofastbackend-sql-fall25.onrender.com',
        details: error.message
      });
    } else if (error.response) {
      // Backend responded with error status
      res.status(error.response.status).json({
        success: false,
        error: 'Backend API error',
        message: `Backend returned ${error.response.status}`,
        details: error.response.data || error.message
      });
    } else {
      // Other errors
      res.status(500).json({
        success: false,
        error: 'Failed to fetch athletes',
        message: 'Unknown error occurred',
        details: error.message
      });
    }
  }
});

/**
 * Get Athlete by ID from Render Backend
 * GET /api/athlete-hydration/:id
 */
router.get('/athlete-hydration/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔄 HYDRATION: Fetching athlete by ID from Render:', id);

    const response = await axios.get(`https://gofastbackend-sql-fall25.onrender.com/api/athletes/${id}`, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ HYDRATION: Successfully fetched athlete:', id);

    res.json({
      success: true,
      message: 'Successfully hydrated athlete from Render backend',
      athlete: response.data,
      source: `https://gofastbackend-sql-fall25.onrender.com/api/athletes/${id}`
    });

  } catch (error) {
    console.error('❌ HYDRATION: Error fetching athlete by ID:', error.message);
    
    if (error.response && error.response.status === 404) {
      res.status(404).json({
        success: false,
        error: 'Athlete not found',
        message: `Athlete with ID ${req.params.id} not found in Render backend`
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch athlete',
        message: 'Error occurred while fetching athlete from Render backend',
        details: error.message
      });
    }
  }
});

/**
 * Test Render Backend Connection
 * GET /api/athlete-hydration/test
 */
router.get('/athlete-hydration/test', async (req, res) => {
  try {
    console.log('🔄 HYDRATION: Testing connection to Render backend...');

    const response = await axios.get('https://gofastbackend-sql-fall25.onrender.com/api/health', {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ HYDRATION: Render backend is accessible');

    res.json({
      success: true,
      message: 'Render backend is accessible',
      backendStatus: response.data,
      backendUrl: 'https://gofastbackend-sql-fall25.onrender.com'
    });

  } catch (error) {
    console.error('❌ HYDRATION: Render backend test failed:', error.message);
    
    res.status(503).json({
      success: false,
      error: 'Render backend not accessible',
      message: 'Cannot connect to Render backend',
      backendUrl: 'https://gofastbackend-sql-fall25.onrender.com',
      details: error.message
    });
  }
});

export default router;
