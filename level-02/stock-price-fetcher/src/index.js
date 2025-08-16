const express = require('express');
const cors = require('cors');
const config = require('./config');
const stockService = require('./services/stockService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/stock/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const stockData = await stockService.getStockPrice(symbol);
    res.json(stockData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stock/:symbol/history', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { days = 30 } = req.query;
    const history = await stockService.getStockHistory(symbol, parseInt(days));
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Start server
app.listen(config.app.port, () => {
  console.log(`Server running on port ${config.app.port}`);
  console.log(`Running on http://localhost:${config.app.port}`);
  console.log('Press Ctrl+C to stop the server');
});