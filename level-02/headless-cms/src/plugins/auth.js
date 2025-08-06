const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../utils/errors');
const logger = require('../utils/logger');

module.exports = {
  generateToken: (userId, roles = []) => {
    return jwt.sign(
      { id: userId, roles },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  },

  verifyToken: (token) => {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      logger.error('Token verification failed:', error.message);
      throw new UnauthorizedError();
    }
  }
};