const rateLimit = require('express-rate-limit');

/**
 * Global per-IP limiter to reduce abuse.
 * Adjust values to your needs.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = globalLimiter;
