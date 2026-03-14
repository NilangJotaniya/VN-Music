// routes/favoritesRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getFavorites, addFavorite, removeFavorite } = require('../controllers/favoritesController');

router.get('/', protect, getFavorites);
router.post('/add', protect, addFavorite);
router.delete('/remove/:videoId', protect, removeFavorite);

module.exports = router;
