// Wraps async route handlers to catch errors and pass them to Express error middleware
module.exports = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
