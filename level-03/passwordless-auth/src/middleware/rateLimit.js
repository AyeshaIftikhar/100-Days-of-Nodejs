import { config } from '../config.js';

// Simple in-memory rate limiter per IP (for demo/dev). For production, use Redis.
const buckets = new Map();

export function rateLimit() {
  const windowMs = config.rateLimit.windowMinutes * 60 * 1000;
  const max = config.rateLimit.maxRequests;

  return function (req, res, next) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const bucket = buckets.get(ip) || { count: 0, reset: now + windowMs };
    if (now > bucket.reset) {
      bucket.count = 0;
      bucket.reset = now + windowMs;
    }
    bucket.count += 1;
    buckets.set(ip, bucket);

    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - bucket.count)));
    res.setHeader('X-RateLimit-Reset', String(Math.floor(bucket.reset / 1000)));

    if (bucket.count > max) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    next();
  };
}
