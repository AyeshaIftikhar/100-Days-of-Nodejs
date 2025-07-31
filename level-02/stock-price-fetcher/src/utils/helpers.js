function formatStockData(data, isGlobalQuote = true) {
  const prefix = isGlobalQuote ? '' : '';
  
  return {
    symbol: isGlobalQuote ? data['01. symbol'] : null,
    open: parseFloat(data[`${prefix}02. open`]),
    high: parseFloat(data[`${prefix}03. high`]),
    low: parseFloat(data[`${prefix}04. low`]),
    price: parseFloat(data[`${prefix}05. price`] || data[`${prefix}04. close`]),
    volume: parseInt(data[`${prefix}06. volume`]),
    latestTradingDay: isGlobalQuote ? data['07. latest trading day'] : null,
    previousClose: isGlobalQuote ? parseFloat(data['08. previous close']) : null,
    change: isGlobalQuote ? parseFloat(data['09. change']) : null,
    changePercent: isGlobalQuote ? data['10. change percent'] : null
  };
}

function validateStockSymbol(symbol) {
  if (!symbol || typeof symbol !== 'string') {
    throw new Error('Stock symbol must be a non-empty string');
  }
  
  if (symbol.length > 5) {
    throw new Error('Stock symbol must be 5 characters or less');
  }
  
  return symbol.toUpperCase();
}

module.exports = {
  formatStockData,
  validateStockSymbol
};