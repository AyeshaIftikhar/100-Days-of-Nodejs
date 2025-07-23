const { verifyToken } = require('../../config/jwt');
const User = require('../../models/User');

const context = async ({ req }) => {
  let token = null;
  let user = null;

  // Get token from headers
  if (req.headers.authorization) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Verify token
  if (token) {
    try {
      const decoded = verifyToken(token);
      user = await User.findById(decoded.id);
    } catch (error) {
      console.error('Token verification failed:', error.message);
    }
  }

  return { user };
};

module.exports = context;