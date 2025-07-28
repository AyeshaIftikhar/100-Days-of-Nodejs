const Message = require('../models/Message');
const logger = require('../utils/logger');

module.exports = (io, socket) => {
  // Join private room
  socket.on('join-private-chat', (roomId) => {
    socket.join(roomId);
    logger.info(`User ${socket.user._id} joined private chat ${roomId}`);
  });

  // Private message handler
  socket.on('private-message', async ({ roomId, content }) => {
    try {
      const message = new Message({
        sender: socket.user._id,
        content,
        room: roomId,
        type: 'private',
      });

      await message.save();

      io.to(roomId).emit('new-private-message', message);
      logger.info(`New private message in room ${roomId} from ${socket.user._id}`);
    } catch (error) {
      logger.error(`Error sending private message: ${error.message}`);
    }
  });

  // Typing indicator
  socket.on('typing-private', (roomId) => {
    socket.to(roomId).emit('user-typing-private', {
      userId: socket.user._id,
      roomId,
    });
  });

  // Stop typing indicator
  socket.on('stop-typing-private', (roomId) => {
    socket.to(roomId).emit('user-stop-typing-private', {
      userId: socket.user._id,
      roomId,
    });
  });
};