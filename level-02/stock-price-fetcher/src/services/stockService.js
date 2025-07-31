const alphaVantageService = require('./alphaVantageService');
const { formatStockData } = require('../utils/helpers');

class StockService {
  async getStockPrice(symbol) {
    try {
      const quote = await alphaVantageService.getStockQuote(symbol);
      return formatStockData(quote);
    } catch (error) {
      throw error;
    }
  }

  async getStockHistory(symbol, days = 30) {
    try {
      const timeSeries = await alphaVantageService.getDailyTimeSeries(symbol, 'full');
      const sortedDates = Object.keys(timeSeries).sort((a, b) => new Date(b) - new Date(a));
      const recentDates = sortedDates.slice(0, days);
      
      return recentDates.map(date => ({
        date,
        ...formatStockData(timeSeries[date], false)
      }));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new StockService();