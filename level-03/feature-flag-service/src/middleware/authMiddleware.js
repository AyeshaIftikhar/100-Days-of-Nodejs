const jwt = require('jsonwebtoken');
const config = require('../../config');
const logger = require('../utils/logger');

// Custom error class
class AuthError extends Error {
  constructor(message, statusCode = 401) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AuthError';
  }
}

/**
 * Middleware to protect routes and validate JWT tokens
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    // Check if token exists
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthError('No authentication token provided');
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret);
      
      // Set user info in request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
      
      next();
    } catch (error) {
      logger.error(`Auth error: ${error.message}`);
      throw new AuthError('Invalid or expired token');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Role-based access control middleware
 * @param {Array} roles - Array of allowed roles
 */
const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthError('User not authenticated', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new AuthError('Not authorized to access this resource', 403));
    }
    
    next();
  };
};

module.exports = {
  protect: authMiddleware,
  authorizeRoles,
  AuthError,
};
