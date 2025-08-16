require('dotenv').config();

module.exports = {
  alphaVantageApiKey: process.env.ALPHA_VANTAGE_API_KEY,
  cacheTTL: process.env.CACHE_TTL || 3600,
  nodeEnv: process.env.NODE_ENV || 'production'
};