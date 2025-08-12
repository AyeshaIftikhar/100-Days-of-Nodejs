const rateLimit = require('express-rate-limit');

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000; // default 1 minute
const max = Number(process.env.RATE_LIMIT_MAX) || 60;

const limiter = rateLimit({
  windowMs,
  max,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = limiter;
