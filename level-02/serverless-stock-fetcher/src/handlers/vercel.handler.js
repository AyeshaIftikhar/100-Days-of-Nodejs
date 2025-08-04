const AlphaVantage = require('../lib/alphaVantage');
const Cache = require('../lib/cache');
const { validateSymbol } = require('../lib/validator');
const { success, error } = require('../lib/response');

const cache = new Cache();
const alphaVantage = new AlphaVantage(process.env.ALPHA_VANTAGE_API_KEY);

module.exports = async (req, res) => {
  try {
    const { symbol } = req.query;
    
    validateSymbol(symbol);
    
    const cacheKey = `stock:${symbol}`;
    const cachedData = await cache.get(cacheKey);
    
    if (cachedData) {
      return success(res, { ...cachedData, cached: true });
    }
    
    const quote = await alphaVantage.getQuote(symbol);
    await cache.set(cacheKey, quote);
    
    success(res, { ...quote, cached: false });
  } catch (err) {
    error(res, err.message, err.statusCode || 500);
  }
};