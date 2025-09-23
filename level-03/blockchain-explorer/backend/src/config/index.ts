import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  environment: process.env.NODE_ENV || 'development',
  
  // Simulation settings
  simulation: {
    enabled: process.env.SIMULATION_ENABLED === 'true' || true,
    interval: process.env.SIMULATION_INTERVAL ? parseInt(process.env.SIMULATION_INTERVAL, 10) : 60000, // 1 minute default
    transactionsPerBlock: process.env.TRANSACTIONS_PER_BLOCK ? parseInt(process.env.TRANSACTIONS_PER_BLOCK, 10) : 5,
    autoAdjustDifficulty: process.env.AUTO_ADJUST_DIFFICULTY === 'true' || true,
  },
  
  // WebSocket settings
  websocket: {
    pingInterval: process.env.WS_PING_INTERVAL ? parseInt(process.env.WS_PING_INTERVAL, 10) : 30000, // 30 seconds default
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  }
};
