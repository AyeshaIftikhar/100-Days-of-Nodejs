const ApiError = require('../utils/apiError');
const config = require('../config/cryptoConfig');

module.exports = (req, res, next) => {
  if (!req.file) {
    return next(new ApiError('No file uploaded', 400));
  }

  if (req.file.size > config.maxFileSize) {
    return next(new ApiError(`File size exceeds limit of ${config.maxFileSize / 1024 / 1024}MB`, 400));
  }

  next();
};