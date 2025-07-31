const axios = require('axios');
const config = require('../config');

class AlphaVantageService {
  constructor() {
    this.apiKey = config.alphaVantage.apiKey;
    this.baseUrl = config.alphaVantage.baseUrl;
  }

  async getStockQuote(symbol) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: this.apiKey
        }
      });
      
      if (response.data['Note']) {
        throw new Error('API rate limit exceeded');
      }
      
      if (!response.data['Global Quote']) {
        throw new Error('Invalid stock symbol or no data available');
      }
      
      return response.data['Global Quote'];
    } catch (error) {
      console.error('AlphaVantageService error:', error.message);
      throw error;
    }
  }

  async getDailyTimeSeries(symbol, outputsize = 'compact') {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: symbol,
          outputsize: outputsize,
          apikey: this.apiKey
        }
      });
      
      if (response.data['Note']) {
        throw new Error('API rate limit exceeded');
      }
      
      if (!response.data['Time Series (Daily)']) {
        throw new Error('Invalid stock symbol or no data available');
      }
      
      return response.data['Time Series (Daily)'];
    } catch (error) {
      console.error('AlphaVantageService error:', error.message);
      throw error;
    }
  }
}

module.exports = new AlphaVantageService();