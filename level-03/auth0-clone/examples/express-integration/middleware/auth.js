const axios = require('axios');

/**
 * Middleware to verify JWT token from Auth0 Clone
 * This middleware extracts the token from the Authorization header,
 * sends it to the Auth0 Clone service for verification, and
 * attaches the user data to the request object if valid.
 */
const verifyToken = async (req, res, next) => {
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
    // Verify token with Auth0 Clone
    // Note: In a real application, you might want to implement token caching
    // to reduce the number of verification requests
    const response = await axios.post(
      `${process.env.AUTH0_CLONE_URL || 'http://localhost:3000'}/api/auth/verify`, 
      { token },
      { 
        headers: { 
          'Content-Type': 'application/json',
          'x-tenant-id': process.env.TENANT_ID || 'default'
        } 
      }
    );
    
    // Attach user info to request
    req.user = response.data.user;
    
    next();
  } catch (error) {
    // Handle different error types
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data.message || 'Token verification failed'
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Auth service unreachable:', error.request);
      return res.status(503).json({
        success: false,
        message: 'Authentication service unavailable'
      });
    } else {
      // Something happened in setting up the request
      console.error('Verification error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during authentication'
      });
    }
  }
};

module.exports = { verifyToken };
