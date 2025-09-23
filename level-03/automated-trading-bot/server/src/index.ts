import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db';
import config from './config';
import logger from './utils/logger';
import { errorHandler, notFound } from './middleware/error';

// Import routes
import authRoutes from './routes/auth.routes';
import strategyRoutes from './routes/strategy.routes';

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

// Set static folder
app.use(express.static('public'));

// Rate limiting
if (config.nodeEnv === 'production') {
  const rateLimit = require('express-rate-limit');
  
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later',
    })
  );
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/strategies', strategyRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Socket.io connection handler
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  // Handle market data subscription
  socket.on('subscribe', ({ market }) => {
    logger.info(`Socket ${socket.id} subscribed to ${market}`);
    socket.join(market);
  });

  // Handle unsubscribe
  socket.on('unsubscribe', ({ market }) => {
    logger.info(`Socket ${socket.id} unsubscribed from ${market}`);
    socket.leave(market);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  logger.info(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

export default server;
