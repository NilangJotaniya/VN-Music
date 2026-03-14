// ============================================================
// controllers/userController.js
// ============================================================

const User = require('../models/User');

// GET /api/user/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || '',
        bio: user.bio || '',
        createdAt: user.createdAt,
        favoritesCount: user.favorites?.length || 0,
        recentlyPlayedCount: user.recentlyPlayed?.length || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile.' });
  }
};

// PUT /api/user/profile
const updateProfile = async (req, res) => {
  try {
    const { name, avatarUrl, bio } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (typeof name === 'string') {
      const trimmedName = name.trim();
      if (trimmedName.length < 2) {
        return res.status(400).json({ message: 'Name must be at least 2 characters.' });
      }
      user.name = trimmedName.slice(0, 50);
    }

    if (typeof avatarUrl === 'string') {
      user.avatarUrl = avatarUrl.trim();
    }

    if (typeof bio === 'string') {
      user.bio = bio.trim().slice(0, 160);
    }

    await user.save();

    return res.json({
      message: 'Profile updated.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || '',
        bio: user.bio || '',
        createdAt: user.createdAt,
        favoritesCount: user.favorites?.length || 0,
        recentlyPlayedCount: user.recentlyPlayed?.length || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile.' });
  }
};

// POST /api/user/recently-played — Add to recently played history
const addRecentlyPlayed = async (req, res) => {
  try {
    const { videoId, title, thumbnail, channelName } = req.body;

    const user = await User.findById(req.user._id);

    // Remove if already in list (to move it to front)
    user.recentlyPlayed = user.recentlyPlayed.filter(
      (s) => s.videoId !== videoId
    );

    // Add to beginning
    user.recentlyPlayed.unshift({ videoId, title, thumbnail, channelName });

    // Keep only last 20 recently played
    if (user.recentlyPlayed.length > 20) {
      user.recentlyPlayed = user.recentlyPlayed.slice(0, 20);
    }

    await user.save();
    res.json({ recentlyPlayed: user.recentlyPlayed });
  } catch (error) {
    res.status(500).json({ message: 'Error updating recently played.' });
  }
};

// GET /api/user/recently-played
const getRecentlyPlayed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('recentlyPlayed');
    res.json({ recentlyPlayed: user.recentlyPlayed });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recently played.' });
  }
};

module.exports = { getProfile, updateProfile, addRecentlyPlayed, getRecentlyPlayed };
