const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/apiError');
const logger = require('../utils/logger');

module.exports = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      throw new ApiError('Authentication token missing', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    socket.user = user;
    next();
  } catch (error) {
    logger.error(`Socket authentication failed: ${error.message}`);
    next(new Error('Authentication error'));
  }
};