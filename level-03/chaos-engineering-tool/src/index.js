const express = require('express');
const dotenv = require('dotenv');
const logger = require('./utils/logger');
const apiRoutes = require('./api/routes');
const { loadConfig } = require('./config/config-loader');
const { setupScheduler } = require('./utils/scheduler');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// API routes
app.use('/api', apiRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({
    name: 'Chaos Monkey',
    description: 'A chaos engineering tool for testing application resilience',
    endpoints: {
      api: '/api'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Initialize and start the server
async function start() {
  try {
    // Load configuration
    const config = loadConfig();
    
    // Setup scheduled chaos experiments if configured
    if (config.scheduledExperiments) {
      setupScheduler(config.scheduledExperiments);
    }
    
    // Start the server
    app.listen(PORT, () => {
      logger.info(`Chaos Monkey server running on port ${PORT}`);
      logger.info('Use API endpoints to trigger chaos experiments');
      logger.info('Or use the CLI with "chaos-monkey" command');
    });
  } catch (err) {
    logger.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  // Clean up resources, stop ongoing chaos experiments
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  // Clean up resources, stop ongoing chaos experiments
  process.exit(0);
});

// Start the server if this file is run directly
if (require.main === module) {
  start();
}

module.exports = { app, start };
