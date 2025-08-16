require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../utils/logger');

module.exports = {
  connect: async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10
      });
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Database connection failed:', error);
      process.exit(1);
    }
  },
  
  disconnect: async () => {
    try {
      await mongoose.disconnect();
      logger.info('Database disconnected successfully');
    } catch (error) {
      logger.error('Database disconnection failed:', error);
    }
  }
};