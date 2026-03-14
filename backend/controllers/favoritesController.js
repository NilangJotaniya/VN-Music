// ============================================================
// controllers/favoritesController.js — Favorites Logic
// ============================================================

const User = require('../models/User');

// GET /api/favorites — Get all favorites for logged-in user
const getFavorites = async (req, res) => {
  try {
    // req.user is set by the auth middleware
    const user = await User.findById(req.user._id).select('favorites');
    res.json({ favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching favorites.' });
  }
};

// POST /api/favorites/add — Add a song to favorites
const addFavorite = async (req, res) => {
  try {
    const { videoId, title, thumbnail, channelName, duration } = req.body;

    if (!videoId || !title) {
      return res.status(400).json({ message: 'videoId and title are required.' });
    }

    const user = await User.findById(req.user._id);

    // Check if already in favorites — prevent duplicates
    const alreadyAdded = user.favorites.some((fav) => fav.videoId === videoId);
    if (alreadyAdded) {
      return res.status(409).json({ message: 'Song already in favorites.' });
    }

    // Add to the beginning of the array (most recent first)
    user.favorites.unshift({ videoId, title, thumbnail, channelName, duration });
    await user.save();

    res.status(201).json({
      message: 'Added to favorites!',
      favorites: user.favorites,
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ message: 'Error adding favorite.' });
  }
};

// DELETE /api/favorites/remove/:videoId — Remove a song from favorites
const removeFavorite = async (req, res) => {
  try {
    const { videoId } = req.params;

    const user = await User.findById(req.user._id);

    // Filter out the song with this videoId
    user.favorites = user.favorites.filter((fav) => fav.videoId !== videoId);
    await user.save();

    res.json({ message: 'Removed from favorites.', favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: 'Error removing favorite.' });
  }
};

module.exports = { getFavorites, addFavorite, removeFavorite };
