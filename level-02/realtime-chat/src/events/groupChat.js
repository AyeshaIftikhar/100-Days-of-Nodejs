const Message = require('../models/Message');
const logger = require('../utils/logger');

module.exports = (io, socket) => {
  // Join group room
  socket.on('join-group-chat', (roomId) => {
    socket.join(roomId);
    logger.info(`User ${socket.user._id} joined group chat ${roomId}`);
  });

  // Group message handler
  socket.on('group-message', async ({ roomId, content }) => {
    try {
      const message = new Message({
        sender: socket.user._id,
        content,
        room: roomId,
        type: 'group',
      });
      await message.save();
      io.to(roomId).emit('new-group-message', message);
      logger.info(`New group message in room ${roomId} from ${socket.user._id}`);
    } catch (error) {
      logger.error(`Error sending group message: ${error.message}`);
    }
  });

  // Typing indicator
  socket.on('typing-group', (roomId) => {
    socket.to(roomId).emit('user-typing-group', {
      userId: socket.user._id,
      roomId,
    });
  });

  // Stop typing indicator
  socket.on('stop-typing-group', (roomId) => {
    socket.to(roomId).emit('user-stop-typing-group', {
      userId: socket.user._id,
      roomId,
    });
  });
};
