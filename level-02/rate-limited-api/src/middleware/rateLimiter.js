const rateLimitService = require('../services/rateLimitService');
const rateLimitConfig = require('../config/rateLimit');
const ApiError = require('../utils/apiError');

const rateLimiter = (options = {}) => {
  const window = options.window || rateLimitConfig.window;
  const max = options.max || rateLimitConfig.max;
  const keyGenerator = options.keyGenerator || defaultKeyGenerator;

  return async (req, res, next) => {
    try {
      const key = keyGenerator(req);
      const { allowed, remaining, reset } = await rateLimitService.checkRateLimit(key);

      res.set({
        'X-RateLimit-Limit': max,
        'X-RateLimit-Remaining': remaining,
        'X-RateLimit-Reset': reset,
      });

      if (!allowed) {
        return next(new ApiError(rateLimitConfig.message, rateLimitConfig.statusCode));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

function defaultKeyGenerator(req) {
  const keys = [];
  
  if (rateLimitConfig.byIp) {
    keys.push(`ip:${req.ip}`);
  }
  
  if (rateLimitConfig.byUser && req.user) {
    keys.push(`user:${req.user.id}`);
  }
  
  if (rateLimitConfig.byApiKey && req.apiKey) {
    keys.push(`apiKey:${req.apiKey}`);
  }
  
  if (keys.length === 0) {
    keys.push(`global:${req.path}`);
  }
  
  return keys.join('|');
}

module.exports = rateLimiter;