// ============================================================
// controllers/authController.js — Register & Login Logic
// ============================================================
// Controllers contain the actual business logic.
// Routes just define WHAT URL maps to WHICH controller function.

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Helper: Generate JWT ──────────────────────────────────────
const generateToken = (userId) => {
  // jwt.sign(payload, secret, options)
  // The token encodes userId so we can identify the user on future requests
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Token is valid for 7 days
  );
};

// ── POST /api/auth/register ───────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    // Create user — password hashing happens in the pre-save hook (see User.js)
    const user = await User.create({ name, email, password });

    // Generate token immediately so user is "logged in" after registration
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || '',
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user by email — need to explicitly select password since schema hides it
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      // Use generic message — don't reveal which field was wrong (security)
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Compare the provided password with the hashed one in DB
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Logged in successfully!',
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        avatarUrl: user.avatarUrl || '',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

module.exports = { register, login };
