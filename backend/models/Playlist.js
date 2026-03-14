// ============================================================
// models/Playlist.js — MongoDB Playlist Schema
// ============================================================

const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Playlist name is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    // "ref: 'User'" creates a reference (like a foreign key in SQL)
    // Allows us to use .populate('userId') to get the full User object
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coverImage: {
      type: String,
      default: '', // Will use first song's thumbnail if empty
    },
    songs: [
      {
        videoId:     { type: String, required: true },
        title:       { type: String, required: true },
        thumbnail:   { type: String },
        channelName: { type: String },
        duration:    { type: String },
        addedAt:     { type: Date, default: Date.now },
      },
    ],
    isPublic: {
      type: Boolean,
      default: false, // Private by default
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries — find all playlists by user
PlaylistSchema.index({ userId: 1 });

module.exports = mongoose.model('Playlist', PlaylistSchema);
