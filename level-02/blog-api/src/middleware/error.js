const ApiError = require('../utils/apiError');

const errorMiddleware = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
};

module.exports = errorMiddleware;