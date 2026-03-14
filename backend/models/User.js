// ============================================================
// models/User.js — MongoDB User Schema
// ============================================================
// Mongoose "schema" defines the shape of documents in MongoDB.
// Think of it like a class/table definition in SQL.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For hashing passwords securely

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true, // removes leading/trailing spaces
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,      // MongoDB index — no two users can share an email
      lowercase: true,   // stores as lowercase automatically
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // IMPORTANT: password won't be returned in queries by default
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
      maxlength: 160,
    },
    favorites: [
      {
        // Each favorite is a YouTube video embedded object (not a ref to another collection)
        // This denormalization is fine since song data is from external API
        videoId:     { type: String, required: true },
        title:       { type: String, required: true },
        thumbnail:   { type: String },
        channelName: { type: String },
        duration:    { type: String },
        addedAt:     { type: Date, default: Date.now },
      },
    ],
    recentlyPlayed: [
      {
        videoId:     { type: String, required: true },
        title:       { type: String, required: true },
        thumbnail:   { type: String },
        channelName: { type: String },
        playedAt:    { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true, // auto-adds createdAt and updatedAt fields
  }
);

// ── Pre-save Hook ─────────────────────────────────────────────
// Runs BEFORE saving a document. Hashes the password if it was modified.
// bcrypt.hash is SLOW by design — that's what makes it secure.
UserSchema.pre('save', async function (next) {
  // Only re-hash if password field was changed (prevents re-hashing on profile update)
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12); // 12 rounds = good balance of security vs speed
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance Method ───────────────────────────────────────────
// Adds a .comparePassword() method to every User document
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
