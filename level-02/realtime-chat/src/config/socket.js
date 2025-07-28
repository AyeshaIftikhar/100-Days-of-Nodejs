const socketio = require('socket.io');
const socketAuth = require('../middlewares/socketAuth');
const connectionHandler = require('../events/connection');

let io = null;

exports.initialize = (server) => {
  io = socketio(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
  });

  // Socket.io middleware for authentication
  io.use(socketAuth);

  // Connection handler
  io.on('connection', (socket) => connectionHandler(io, socket));

  return io;
};

exports.getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};