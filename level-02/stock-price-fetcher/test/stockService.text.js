const stockService = require('../src/services/stockService');
const alphaVantageService = require('../src/services/alphaVantageService');

jest.mock('../src/services/alphaVantageService');

describe('StockService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStockPrice', () => {
    it('should return formatted stock data', async () => {
      const mockQuote = {
        '01. symbol': 'AAPL',
        '02. open': '150.0000',
        '03. high': '155.0000',
        '04. low': '148.0000',
        '05. price': '153.0000',
        '06. volume': '12345678',
        '07. latest trading day': '2023-05-01',
        '08. previous close': '149.0000',
        '09. change': '4.0000',
        '10. change percent': '2.68%'
      };
      
      alphaVantageService.getStockQuote.mockResolvedValue(mockQuote);
      
      const result = await stockService.getStockPrice('AAPL');
      
      expect(result).toEqual({
        symbol: 'AAPL',
        open: 150,
        high: 155,
        low: 148,
        price: 153,
        volume: 12345678,
        latestTradingDay: '2023-05-01',
        previousClose: 149,
        change: 4,
        changePercent: '2.68%'
      });
    });
  });

  describe('getStockHistory', () => {
    it('should return historical stock data', async () => {
      const mockTimeSeries = {
        '2023-05-01': {
          '1. open': '150.0000',
          '2. high': '155.0000',
          '3. low': '148.0000',
          '4. close': '153.0000',
          '5. volume': '12345678'
        },
        '2023-04-30': {
          '1. open': '149.0000',
          '2. high': '152.0000',
          '3. low': '147.0000',
          '4. close': '150.0000',
          '5. volume': '87654321'
        }
      };
      
      alphaVantageService.getDailyTimeSeries.mockResolvedValue(mockTimeSeries);
      
      const result = await stockService.getStockHistory('AAPL', 2);
      
      expect(result).toEqual([
        {
          date: '2023-05-01',
          open: 150,
          high: 155,
          low: 148,
          price: 153,
          volume: 12345678
        },
        {
          date: '2023-04-30',
          open: 149,
          high: 152,
          low: 147,
          price: 150,
          volume: 87654321
        }
      ]);
    });
  });
});