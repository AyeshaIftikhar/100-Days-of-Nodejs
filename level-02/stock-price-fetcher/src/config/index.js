require('dotenv').config();

module.exports = {
  alphaVantage: {
    apiKey: process.env.ALPHA_VANTAGE_API_KEY,
    baseUrl: 'https://www.alphavantage.co/query'
  },
  app: {
    port: process.env.PORT || 3000
  }
};