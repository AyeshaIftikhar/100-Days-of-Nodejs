const AlphaVantage = require('../lib/alphaVantage');
const Cache = require('../lib/cache');
const { validateSymbol } = require('../lib/validator');
const { success, error } = require('../lib/response');
require('dotenv').config();

const cache = new Cache();
const alphaVantage = new AlphaVantage(process.env.ALPHA_VANTAGE_API_KEY);

exports.handler = async (event) => {
  try {
    const symbol = event.queryStringParameters?.symbol;
    
    validateSymbol(symbol);
    
    const cacheKey = `stock:${symbol}`;
    const cachedData = await cache.get(cacheKey);
    
    if (cachedData) {
      return success({ ...cachedData, cached: true });
    }
    
    const quote = await alphaVantage.getQuote(symbol);
    await cache.set(cacheKey, quote);
    
    return success({ ...quote, cached: false });
  } catch (err) {
    return error(err.message, err.statusCode || 500);
  }
};