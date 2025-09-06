const logger = require('../utils/logger');

// Handle errors throughout the application
const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Log error
  logger.error(`${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  // Include stack trace in development mode
  const errorResponse = {
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  };
  
  // Send error response
  res.status(statusCode).json(errorResponse);
};

module.exports = errorMiddleware;
