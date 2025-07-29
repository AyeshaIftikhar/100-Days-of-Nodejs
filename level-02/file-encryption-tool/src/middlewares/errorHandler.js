const ApiError = require('../utils/apiError');
const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    logger.error(`Error: ${err.message}`);
    logger.error(err.stack);
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(el => el.message);
    err.message = `Validation error: ${messages.join('. ')}`;
    err.statusCode = 400;
  }

  if (err.code === 11000) {
    err.message = 'Duplicate field value entered';
    err.statusCode = 400;
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
};