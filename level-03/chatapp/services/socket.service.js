const User = require('../models/user.model');
const Room = require('../models/room.model');
const Message = require('../models/message.model');
const { verifyToken } = require('../config/jwt.config');

// Socket.io handler
const socketHandler = (io) => {
  // User socket mapping
  const connectedUsers = new Map();
  
  io.on('connection', async (socket) => {
    console.log('New client connected');
    
    // Authenticate user using token
    const token = socket.handshake.auth.token;
    if (!token) {
      socket.emit('error', { message: 'Authentication required' });
      socket.disconnect();
      return;
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      socket.emit('error', { message: 'Invalid token' });
      socket.disconnect();
      return;
    }
    
    try {
      // Get user from database
      const user = await User.findById(decoded.id);
      if (!user) {
        socket.emit('error', { message: 'User not found' });
        socket.disconnect();
        return;
      }
      
      // Set user as online
      await User.findByIdAndUpdate(decoded.id, { status: 'online' });
      
      // Store user connection
      socket.userId = user._id;
      socket.username = user.username;
      connectedUsers.set(user._id.toString(), socket.id);
      
      // Send welcome message
      socket.emit('connected', { 
        message: 'Connected to chat server',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          status: 'online'
        }
      });
      
      // Notify others about user status change
      io.emit('userStatusChanged', { 
        userId: user._id, 
        username: user.username,
        status: 'online' 
      });
      
      // Join user to their rooms
      const rooms = await Room.find({ participants: user._id });
      rooms.forEach(room => {
        socket.join(room._id.toString());
      });
      
      // Handle send message
      socket.on('sendMessage', async (data) => {
        try {
          const { roomId, content, messageType = 'text' } = data;
          
          // Check if room exists and user is a participant
          const room = await Room.findById(roomId);
          if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
          }
          
          if (!room.participants.some(p => p.equals(user._id))) {
            socket.emit('error', { message: 'You are not a participant in this room' });
            return;
          }
          
          // Create and save message
          const message = new Message({
            room: roomId,
            sender: user._id,
            content,
            messageType,
            readBy: [user._id]
          });
          
          await message.save();
          
          // Populate sender info
          await message.populate('sender', 'username email avatar');
          
          // Emit message to room
          io.to(roomId).emit('newMessage', {
            id: message._id,
            room: message.room,
            sender: message.sender,
            content: message.content,
            messageType: message.messageType,
            readBy: message.readBy,
            createdAt: message.createdAt
          });
        } catch (error) {
          console.error('Send message error:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });
      
      // Handle join room
      socket.on('joinRoom', async (data) => {
        try {
          const { roomId } = data;
          
          // Check if room exists and user is a participant
          const room = await Room.findById(roomId);
          if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
          }
          
          if (!room.participants.some(p => p.equals(user._id))) {
            socket.emit('error', { message: 'You are not a participant in this room' });
            return;
          }
          
          // Join the room
          socket.join(roomId);
          
          // Notify room
          socket.to(roomId).emit('userJoined', { 
            roomId, 
            user: {
              id: user._id,
              username: user.username
            }
          });
          
          console.log(`${user.username} joined room ${roomId}`);
        } catch (error) {
          console.error('Join room error:', error);
          socket.emit('error', { message: 'Failed to join room' });
        }
      });
      
      // Handle leave room
      socket.on('leaveRoom', async (data) => {
        try {
          const { roomId } = data;
          
          // Leave the room
          socket.leave(roomId);
          
          // Notify room
          socket.to(roomId).emit('userLeft', { 
            roomId, 
            user: {
              id: user._id,
              username: user.username
            }
          });
          
          console.log(`${user.username} left room ${roomId}`);
        } catch (error) {
          console.error('Leave room error:', error);
          socket.emit('error', { message: 'Failed to leave room' });
        }
      });
      
      // Handle typing indicator
      socket.on('typing', (data) => {
        const { roomId } = data;
        socket.to(roomId).emit('userTyping', { 
          roomId, 
          user: {
            id: user._id,
            username: user.username
          }
        });
      });
      
      // Handle stop typing indicator
      socket.on('stopTyping', (data) => {
        const { roomId } = data;
        socket.to(roomId).emit('userStoppedTyping', { 
          roomId, 
          user: {
            id: user._id,
            username: user.username
          }
        });
      });
      
      // WebRTC signaling
      socket.on('webrtc-offer', (data) => {
        const { target, offer } = data;
        const targetSocketId = connectedUsers.get(target);
        
        if (targetSocketId) {
          io.to(targetSocketId).emit('webrtc-offer', {
            from: user._id.toString(),
            offer
          });
        }
      });
      
      socket.on('webrtc-answer', (data) => {
        const { target, answer } = data;
        const targetSocketId = connectedUsers.get(target);
        
        if (targetSocketId) {
          io.to(targetSocketId).emit('webrtc-answer', {
            from: user._id.toString(),
            answer
          });
        }
      });
      
      socket.on('webrtc-ice-candidate', (data) => {
        const { target, candidate } = data;
        const targetSocketId = connectedUsers.get(target);
        
        if (targetSocketId) {
          io.to(targetSocketId).emit('webrtc-ice-candidate', {
            from: user._id.toString(),
            candidate
          });
        }
      });
      
      socket.on('webrtc-call-request', (data) => {
        const { target, callType } = data;
        const targetSocketId = connectedUsers.get(target);
        
        if (targetSocketId) {
          io.to(targetSocketId).emit('webrtc-call-request', {
            from: user._id.toString(),
            fromUsername: user.username,
            callType
          });
        }
      });
      
      socket.on('webrtc-call-response', (data) => {
        const { target, accepted } = data;
        const targetSocketId = connectedUsers.get(target);
        
        if (targetSocketId) {
          io.to(targetSocketId).emit('webrtc-call-response', {
            from: user._id.toString(),
            accepted
          });
        }
      });
      
      socket.on('webrtc-hang-up', (data) => {
        const { target } = data;
        const targetSocketId = connectedUsers.get(target);
        
        if (targetSocketId) {
          io.to(targetSocketId).emit('webrtc-hang-up', {
            from: user._id.toString()
          });
        }
      });
      
      // Handle status change
      socket.on('changeStatus', async (data) => {
        try {
          const { status } = data;
          
          // Update user status
          await User.findByIdAndUpdate(user._id, { status });
          
          // Notify all connected clients
          io.emit('userStatusChanged', { 
            userId: user._id, 
            username: user.username,
            status 
          });
        } catch (error) {
          console.error('Change status error:', error);
          socket.emit('error', { message: 'Failed to change status' });
        }
      });
      
      // Handle disconnect
      socket.on('disconnect', async () => {
        try {
          // Remove from connected users
          connectedUsers.delete(user._id.toString());
          
          // Set user as offline
          await User.findByIdAndUpdate(user._id, { status: 'offline' });
          
          // Notify others
          io.emit('userStatusChanged', { 
            userId: user._id, 
            username: user.username,
            status: 'offline' 
          });
          
          console.log('Client disconnected:', user.username);
        } catch (error) {
          console.error('Disconnect error:', error);
        }
      });
    } catch (error) {
      console.error('Socket connection error:', error);
      socket.emit('error', { message: 'Server error' });
      socket.disconnect();
    }
  });
};

module.exports = { socketHandler };
