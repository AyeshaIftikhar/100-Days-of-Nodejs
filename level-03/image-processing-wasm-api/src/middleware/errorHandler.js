const multer = require('multer');
const { logger } = require('../services/loggerService');

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`Error: ${err.message}`, { 
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  
  // Multer file size error
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  }
  
  // Check for specific error types
  if (err.message.includes('Only image files are allowed')) {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed'
    });
  }
  
  // Check for validation errors
  if (err.message.includes('required') || 
      err.message.includes('must be') || 
      err.message.includes('Unsupported operation')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  // Default error response
  res.status(500).json({
    success: false,
    message: 'An error occurred during processing',
    error: process.env.NODE_ENV === 'production' ? {} : err.message,
    requestId: req.id // For tracking in logs
  });
};

module.exports = errorHandler;
