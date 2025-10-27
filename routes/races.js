const express = require('express');
const router = express.Router();
const raceController = require('../controllers/raceController');

// Race routes
router.get('/', raceController.getRaces);
router.get('/:id', raceController.getRace);
router.post('/', raceController.createRace);
router.put('/:id', raceController.updateRace);
router.delete('/:id', raceController.deleteRace);

// User race routes
router.post('/:id/register', raceController.registerForRace);
router.get('/user/:userId', raceController.getUserRaces);
router.put('/:id/goal', raceController.setGoal);
router.put('/:id/result', raceController.setResult);

module.exports = router;
