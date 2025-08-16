// src/utils/config.js
module.exports = {
  port: process.env.PORT || 3000,
  cacheTTL: process.env.CACHE_TTL || 86400,
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  vercelEnv: process.env.VERCEL_ENV || 'production',
};
