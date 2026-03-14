// routes/youtubeRoutes.js
const express = require('express');
const router = express.Router();
const { searchVideos, getTrending, getRelated } = require('../controllers/youtubeController');

// Public routes — no auth needed to search music
router.get('/search', searchVideos);
router.get('/trending', getTrending);
router.get('/related', getRelated);

module.exports = router;
