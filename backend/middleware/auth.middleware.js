// ============================================================
// middleware/auth.middleware.js - JWT Authentication Middleware
// ============================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ============================================================
// protect - Verify JWT token and attach user to request
// ============================================================
const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token found, deny access
  if (!token) {
    return res.status(401).json({ 
      message: 'Access denied. No token provided. Please log in.' 
    });
  }

  try {
    // Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by ID from the token payload
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found. Token invalid.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Your account has been deactivated.' });
    }

    // Attach user to the request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ message: 'Invalid token. Please log in again.' });
  }
};

// ============================================================
// authorize - Check if user has required role(s)
// Usage: authorize('admin') or authorize('admin', 'teacher')
// ============================================================
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Role '${req.user.role}' is not authorized for this action.`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
