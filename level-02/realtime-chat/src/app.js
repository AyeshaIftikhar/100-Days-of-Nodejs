const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketConfig = require('./config/socket');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const errorHandler = require('./middlewares/errorHandler');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
socketConfig.initialize(server);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
}));
app.use(helmet());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/chat', chatRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Chat server running on port ${PORT}`);
});

module.exports = { app, server };