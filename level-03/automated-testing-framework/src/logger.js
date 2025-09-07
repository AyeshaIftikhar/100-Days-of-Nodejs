'use strict';

const winston = require('winston');
const path = require('path');
const fs = require('fs-extra');

// Ensure logs directory exists
fs.ensureDirSync(path.join(process.cwd(), 'logs'));

// Define log format
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    logFormat
  ),
  defaultMeta: { service: 'automated-testing-framework' },
  transports: [
    // Console transport for all logs
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    // File transport for info logs
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'app.log'),
      level: 'info'
    }),
    // File transport for error logs
    new winston.transports.File({ 
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error'
    })
  ]
});

// Add stream for piping to other processes
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

module.exports = logger;
