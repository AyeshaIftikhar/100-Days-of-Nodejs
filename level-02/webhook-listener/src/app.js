const express = require('express');
const dotenv = require('dotenv');
const webhookRoutes = require('./routes/webhookRoutes');
const { startNgrok } = require('./config/ngrok');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/webhook', webhookRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start ngrok tunnel
  if (process.env.NGROK_AUTH_TOKEN) {
    await startNgrok();
  } else {
    console.log('Ngrok auth token not provided. Running without tunnel.');
  }
});

module.exports = app;