const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const User = require('../models/user.model');
const { Role } = require('../models/role.model');

// Middleware to verify JWT token and attach user to request
const authenticateJwt = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. No token provided.' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, jwtConfig.secret);
    
    // Attach user info to request
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired. Please login again.'
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

// Middleware to check if user has required permissions
const authorize = (permissions = []) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authorization required',
        });
      }

      // Super admin bypass
      if (req.user.isAdmin) {
        return next();
      }

      // If no specific permissions required
      if (!permissions.length) {
        return next();
      }

      const user = await User.findById(req.user.id).populate('roles');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Get all user roles
      const roleIds = user.roles.map(role => role._id);
      
      // Get all permissions from those roles
      const roles = await Role.find({ _id: { $in: roleIds } });
      const userPermissions = new Set();
      
      // Add all permissions from all roles
      roles.forEach(role => {
        role.permissions.forEach(permission => {
          userPermissions.add(permission);
        });
      });

      // Check if user has wildcard permission
      if (userPermissions.has('*')) {
        return next();
      }

      // Check if user has all required permissions
      const hasAllPermissions = permissions.every(permission => 
        userPermissions.has(permission)
      );

      if (hasAllPermissions) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Authorization check failed',
        error: error.message,
      });
    }
  };
};

module.exports = { authenticateJwt, authorize };
