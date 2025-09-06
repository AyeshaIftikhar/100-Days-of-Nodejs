const { createClient } = require('redis');
const config = require('../../config');
const logger = require('./logger');

// Create a Redis client instance
const createRedisClient = async () => {
  try {
    const client = createClient({
      url: `redis://${config.redis.host}:${config.redis.port}`,
    });
    
    // Register event handlers
    client.on('error', (err) => {
      logger.error('Redis client error:', err);
    });
    
    client.on('connect', () => {
      logger.info('Redis client connected');
    });
    
    client.on('reconnecting', () => {
      logger.info('Redis client reconnecting');
    });
    
    client.on('end', () => {
      logger.info('Redis client connection closed');
    });
    
    // Connect to Redis
    await client.connect();
    
    return client;
  } catch (error) {
    logger.error('Failed to create Redis client:', error);
    throw error;
  }
};

module.exports = {
  createRedisClient,
};
