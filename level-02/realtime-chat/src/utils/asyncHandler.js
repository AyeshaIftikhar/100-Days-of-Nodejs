const ApiError = require('./apiError');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    if (!(err instanceof ApiError)) {
      err = new ApiError(err.message, 500);
    }
    next(err);
  });
};

module.exports = asyncHandler;