const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// User routes
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

// Profile routes
router.get('/:id/profile', userController.getProfile);
router.put('/:id/profile', userController.updateProfile);

// Dashboard data
router.get('/:id/dashboard', userController.getDashboard);
router.get('/:id/reflections', userController.getReflections);
router.post('/:id/reflections', userController.createReflection);

module.exports = router;
