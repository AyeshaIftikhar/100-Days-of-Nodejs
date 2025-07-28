const privateChatHandler = require('./privateChat');
const groupChatHandler = require('./groupChat');
const User = require('../models/User');
const logger = require('../utils/logger');

module.exports = (io, socket) => {
  logger.info(`New connection: ${socket.id}`);

  // Add user to online list
  socket.on('user-online', async (userId) => {
    try {
      await User.findByIdAndUpdate(userId, { isOnline: true });
      socket.broadcast.emit('user-status-changed', { userId, isOnline: true });
    } catch (error) {
      logger.error(`Error setting user online: ${error.message}`);
    }
  });

  // Handle private chat events
  privateChatHandler(io, socket);

  // Handle group chat events
  groupChatHandler(io, socket);

  // Disconnect handler
  socket.on('disconnect', async () => {
    logger.info(`User disconnected: ${socket.id}`);
    if (socket.user) {
      try {
        await User.findByIdAndUpdate(socket.user._id, { isOnline: false, lastSeen: new Date() });
        socket.broadcast.emit('user-status-changed', { 
          userId: socket.user._id, 
          isOnline: false,
          lastSeen: new Date()
        });
      } catch (error) {
        logger.error(`Error handling disconnect: ${error.message}`);
      }
    }
  });
};