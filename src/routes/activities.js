const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');

// Activity routes
router.get('/', activityController.getActivities);
router.get('/:id', activityController.getActivity);
router.post('/', activityController.createActivity);
router.put('/:id', activityController.updateActivity);
router.delete('/:id', activityController.deleteActivity);

// Activity analysis
router.get('/user/:userId/summary', activityController.getUserSummary);
router.get('/user/:userId/trends', activityController.getTrends);
router.post('/sync', activityController.syncFromGarmin);

module.exports = router;
