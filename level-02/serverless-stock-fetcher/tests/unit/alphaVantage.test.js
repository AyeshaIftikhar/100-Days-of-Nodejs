const AlphaVantage = require('../../src/lib/alphaVantage');

describe('AlphaVantage', () => {
  it('should throw error for invalid symbol', async () => {
    const av = new AlphaVantage('demo');
    await expect(av.getQuote('INVALID')).rejects.toThrow('Invalid stock symbol');
  });

  it('should format quote correctly', () => {
    const av = new AlphaVantage('demo');
    const data = {
      '01. symbol': 'IBM',
      '02. open': '125.05',
      '03. high': '125.78',
      '04. low': '124.77',
      '05. price': '125.34',
      '06. volume': '4234567',
      '07. latest trading day': '2023-11-15',
      '08. previous close': '124.89',
      '09. change': '0.45',
      '10. change percent': '0.36%'
    };
    const result = av._formatQuote(data);
    expect(result).toEqual({
      symbol: 'IBM',
      open: 125.05,
      high: 125.78,
      low: 124.77,
      price: 125.34,
      volume: 4234567,
      latestTradingDay: '2023-11-15',
      previousClose: 124.89,
      change: 0.45,
      changePercent: '0.36%'
    });
  });
});
