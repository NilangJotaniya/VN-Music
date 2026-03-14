// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getProfile, updateProfile, addRecentlyPlayed, getRecentlyPlayed } = require('../controllers/userController');

// All user routes require authentication — protect middleware runs first
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/recently-played', protect, getRecentlyPlayed);
router.post('/recently-played', protect, addRecentlyPlayed);

module.exports = router;
