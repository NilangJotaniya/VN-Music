// ============================================================
// controllers/playlistController.js — Playlist CRUD Logic
// ============================================================

const Playlist = require('../models/Playlist');

// GET /api/playlists — Get all playlists for logged-in user
const getPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.user._id })
      .sort({ updatedAt: -1 }); // Most recently updated first
    res.json({ playlists });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching playlists.' });
  }
};

// GET /api/playlists/:id — Get a single playlist
const getPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOne({
      _id: req.params.id,
      userId: req.user._id, // Security: only owner can view
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found.' });
    }

    res.json({ playlist });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching playlist.' });
  }
};

// POST /api/playlists — Create a new playlist
const createPlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Playlist name is required.' });
    }

    const playlist = await Playlist.create({
      name,
      description: description || '',
      userId: req.user._id,
      songs: [],
    });

    res.status(201).json({ message: 'Playlist created!', playlist });
  } catch (error) {
    res.status(500).json({ message: 'Error creating playlist.' });
  }
};

// PUT /api/playlists/:id — Rename/update a playlist
const updatePlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;

    const playlist = await Playlist.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { name, description },
      { new: true } // Return the updated document
    );

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found.' });
    }

    res.json({ message: 'Playlist updated!', playlist });
  } catch (error) {
    res.status(500).json({ message: 'Error updating playlist.' });
  }
};

// DELETE /api/playlists/:id — Delete a playlist
const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found.' });
    }

    res.json({ message: 'Playlist deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting playlist.' });
  }
};

// POST /api/playlists/:id/songs — Add a song to playlist
const addSong = async (req, res) => {
  try {
    const { videoId, title, thumbnail, channelName, duration } = req.body;

    const playlist = await Playlist.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found.' });
    }

    // Prevent duplicate songs
    const alreadyAdded = playlist.songs.some((s) => s.videoId === videoId);
    if (alreadyAdded) {
      return res.status(409).json({ message: 'Song already in this playlist.' });
    }

    playlist.songs.push({ videoId, title, thumbnail, channelName, duration });

    // Set cover image to first song's thumbnail if not set
    if (!playlist.coverImage && thumbnail) {
      playlist.coverImage = thumbnail;
    }

    await playlist.save();
    res.json({ message: 'Song added to playlist!', playlist });
  } catch (error) {
    res.status(500).json({ message: 'Error adding song to playlist.' });
  }
};

// DELETE /api/playlists/:id/songs/:videoId — Remove a song from playlist
const removeSong = async (req, res) => {
  try {
    const playlist = await Playlist.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found.' });
    }

    playlist.songs = playlist.songs.filter(
      (s) => s.videoId !== req.params.videoId
    );
    await playlist.save();

    res.json({ message: 'Song removed from playlist.', playlist });
  } catch (error) {
    res.status(500).json({ message: 'Error removing song.' });
  }
};

module.exports = {
  getPlaylists,
  getPlaylist,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSong,
  removeSong,
};
