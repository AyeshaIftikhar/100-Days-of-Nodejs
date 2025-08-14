// Dummy auth middleware for pdf-generator

// Dummy auth middleware
const protect = (req, res, next) => {
  // Placeholder: Add authentication logic here
  next();
};

module.exports = {
  protect
};
