// ============================================================
// middleware/auth.js — JWT Authentication Middleware
// ============================================================
// Middleware = a function that runs BETWEEN receiving a request
// and sending a response. This one checks if the user is logged in.
//
// Flow: Request → auth middleware checks token → route handler responds

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    // 1. Get token from Authorization header
    // Header format: "Authorization: Bearer eyJhbGci..."
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided. Please log in.' });
    }

    const token = authHeader.split(' ')[1]; // Extract the token part after "Bearer "

    // 2. Verify the token (checks signature + expiry)
    // jwt.verify throws if token is invalid/expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { userId: '...', iat: 1234567890, exp: 1234567890 }

    // 3. Find the user from DB using the ID stored in the token
    // select('-password') excludes the password field from the result
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    // 4. Attach user to the request object so routes can access it
    req.user = user;

    // 5. Call next() to pass control to the actual route handler
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    }
    return res.status(500).json({ message: 'Authentication error.' });
  }
};

module.exports = { protect };
