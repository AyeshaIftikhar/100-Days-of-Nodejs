const axios = require('axios');
const config = require('../utils/config');
const logger = require('../utils/logger');

class AlphaVantage {
  constructor(apiKey) {
    this.apiKey = apiKey || config.alphaVantageApiKey;
    this.baseUrl = 'https://www.alphavantage.co/query';
  }

  async getQuote(symbol) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: this.apiKey
        },
        timeout: 5000
      });

      if (response.data.Note) {
        throw new Error('API rate limit exceeded');
      }

      if (!response.data['Global Quote']) {
        throw new Error('Invalid stock symbol');
      }

      return this._formatQuote(response.data['Global Quote']);
    } catch (error) {
      logger.error(`AlphaVantage error: ${error.message}`);
      throw error;
    }
  }

  _formatQuote(data) {
    return {
      symbol: data['01. symbol'],
      open: parseFloat(data['02. open']),
      high: parseFloat(data['03. high']),
      low: parseFloat(data['04. low']),
      price: parseFloat(data['05. price']),
      volume: parseInt(data['06. volume']),
      latestTradingDay: data['07. latest trading day'],
      previousClose: parseFloat(data['08. previous close']),
      change: parseFloat(data['09. change']),
      changePercent: data['10. change percent']
    };
  }
}

module.exports = AlphaVantage;