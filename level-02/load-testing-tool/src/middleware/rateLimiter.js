// src/middleware/rateLimiter.js

// Simple in-memory rate limiter for demonstration
const rateLimitWindowMs = 60 * 1000; // 1 minute
const maxRequestsPerWindow = 30;
const ipRequestCounts = new Map();

function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  if (!ipRequestCounts.has(ip)) {
    ipRequestCounts.set(ip, []);
  }
  const timestamps = ipRequestCounts.get(ip).filter(ts => now - ts < rateLimitWindowMs);
  if (timestamps.length >= maxRequestsPerWindow) {
    return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
  }
  timestamps.push(now);
  ipRequestCounts.set(ip, timestamps);
  next();
}

module.exports = { rateLimiter };
