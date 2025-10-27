// API Configuration for GoFast Backend
// Single source of truth for all API endpoints

const API_CONFIG = {
  // Base URLs
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://gofastbackend-sql-fall25.onrender.com/api'
    : 'http://localhost:3001/api',

  // Athlete Management Endpoints
  ATHLETE: {
    CREATE_OR_FIND: '/athleteuser',           // POST - Create/find athlete from Firebase
    GET_PROFILE: '/athlete/:id',              // GET - Get athlete profile
    UPDATE_PROFILE: '/athlete/:id/profile',   // PUT - Update athlete profile
    DELETE_BY_ID: '/athlete/:id',             // DELETE - Delete athlete by ID
    DELETE_BY_EMAIL: '/athlete/email/:email', // DELETE - Delete athlete by email
    DELETE_BY_FIREBASE: '/athlete/firebase/:firebaseId', // DELETE - Delete athlete by Firebase ID
    BULK_DELETE: '/athlete/bulk',             // DELETE - Bulk delete athletes
  },

  // Training Endpoints (Future)
  TRAINING: {
    GET_PLANS: '/training/plans',             // GET - Get training plans
    CREATE_PLAN: '/training/plans',           // POST - Create training plan
  },

  // RunCrew Endpoints (Future)
  RUNCREW: {
    GET_CREWS: '/runcrew/crews',              // GET - Get available crews
    CREATE_CREW: '/runcrew/crews',            // POST - Create new crew
  },

  // Activities Endpoints (Future)
  ACTIVITIES: {
    GET_ACTIVITIES: '/activities',            // GET - Get athlete activities
    SYNC_GARMIN: '/activities/sync',           // POST - Sync Garmin activities
  },

  // System Endpoints
  SYSTEM: {
    HEALTH_CHECK: '/health',                  // GET - Health check
  }
};

// Helper function to build full URLs
const buildUrl = (endpoint, params = {}) => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  // Replace URL parameters
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });
  
  return url;
};

// Export for use in routes and services
module.exports = {
  API_CONFIG,
  buildUrl
};
