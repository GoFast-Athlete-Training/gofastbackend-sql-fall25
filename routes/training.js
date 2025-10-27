const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');

// Training plan routes
router.post('/plans', trainingController.createPlan);
router.get('/plans', trainingController.getPlans);
router.get('/plans/:id', trainingController.getPlan);
router.put('/plans/:id', trainingController.updatePlan);
router.delete('/plans/:id', trainingController.deletePlan);

// Workout routes
router.get('/plans/:planId/workouts', trainingController.getWorkouts);
router.get('/plans/:planId/workouts/:week', trainingController.getWeekWorkouts);
router.put('/workouts/:id/complete', trainingController.completeWorkout);

// AI-powered routes
router.post('/plans/generate', trainingController.generatePlan);
router.post('/workouts/analyze', trainingController.analyzeWorkout);

module.exports = router;
