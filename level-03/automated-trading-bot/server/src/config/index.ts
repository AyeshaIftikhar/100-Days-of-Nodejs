import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  // Server configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // MongoDB connection
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/trading-bot',
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret_change_this_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // Exchange API credentials
  exchanges: {
    binance: {
      apiKey: process.env.BINANCE_API_KEY || '',
      apiSecret: process.env.BINANCE_API_SECRET || '',
    },
    coinbase: {
      apiKey: process.env.COINBASE_API_KEY || '',
      apiSecret: process.env.COINBASE_API_SECRET || '',
    },
  },
  
  // Logging
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
  
  // Redis cache (optional)
  redis: {
    url: process.env.REDIS_URL,
    enabled: !!process.env.REDIS_URL,
  },
  
  // Feature flags
  features: {
    enablePaperTrading: process.env.ENABLE_PAPER_TRADING === 'true',
    enableLiveTrading: process.env.ENABLE_LIVE_TRADING === 'true',
  },
};

export default config;
