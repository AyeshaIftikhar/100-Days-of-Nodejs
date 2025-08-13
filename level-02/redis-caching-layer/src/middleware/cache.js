const RedisService = require("../services/redisService");
const redisService = new RedisService();

// const cache = (keyPrefix) => {
//   return async (req, res, next) => {
//     const key = `${keyPrefix}:${req.originalUrl || req.url}`;
//     try {
//       const cachedData = await redisService.get(key);
//       if (cachedData) {
//         console.log('Serving from cache');
//         return res.status(200).json(cachedData);
//       }
//       // Override res.json to cache the response before sending
//       const originalJson = res.json;
//       res.json = (body) => {
//         redisService.set(key, body);
//         originalJson.call(res, body);
//       };
//       next();
//     } catch (error) {
//       console.error('Cache middleware error:', error);
//       next();
//     }
//   };
// };

const cache = (keyPrefix) => {
  return async function cache(req, res, next) {
    const key = req.originalUrl;
    try {
      const cachedData = await redisService.get(key);
      if (cachedData) {
        return res.json(cachedData);
      }
      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      next();
    }
  };
};

const clearCache = (keyPattern) => {
  return async (req, res, next) => {
    try {
      await redisService.clearCacheByPattern(keyPattern);
      next();
    } catch (error) {
      console.error("Clear cache middleware error:", error);
      next();
    }
  };
};

module.exports = { cache, clearCache };
