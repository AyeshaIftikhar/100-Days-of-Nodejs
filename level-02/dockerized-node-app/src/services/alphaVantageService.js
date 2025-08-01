const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');
const cache = require('./cacheService');

class AlphaVantageService {
  constructor() {
    this.apiKey = config.alphaVantage.apiKey;
    this.baseUrl = config.alphaVantage.baseUrl;
  }

  async fetchFromAPI(params) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          ...params,
          apikey: this.apiKey
        },
        timeout: 5000
      });

      if (response.data.Note) {
        throw new Error('API rate limit exceeded');
      }

      return response.data;
    } catch (error) {
      logger.error(`AlphaVantage API error: ${error.message}`);
      throw error;
    }
  }

  async getGlobalQuote(symbol) {
    const cacheKey = `av:quote:${symbol}`;
    try {
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      const data = await this.fetchFromAPI({
        function: 'GLOBAL_QUOTE',
        symbol: symbol
      });

      if (!data['Global Quote']) {
        throw new Error('Invalid stock symbol or no data available');
      }

      await cache.set(cacheKey, data['Global Quote'], 60); // Cache for 1 minute
      return data['Global Quote'];
    } catch (error) {
      logger.error(`Failed to get global quote: ${error.message}`);
      throw error;
    }
  }

  async getTimeSeriesDaily(symbol, outputsize = 'compact') {
    const cacheKey = `av:daily:${symbol}:${outputsize}`;
    try {
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      const data = await this.fetchFromAPI({
        function: 'TIME_SERIES_DAILY',
        symbol: symbol,
        outputsize: outputsize
      });

      if (!data['Time Series (Daily)']) {
        throw new Error('Invalid stock symbol or no data available');
      }

      await cache.set(cacheKey, data['Time Series (Daily)'], 3600); // Cache for 1 hour
      return data['Time Series (Daily)'];
    } catch (error) {
      logger.error(`Failed to get daily time series: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new AlphaVantageService();