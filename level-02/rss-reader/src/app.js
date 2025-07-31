const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const feedRoutes = require('./routes/feedRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const errorHandler = require('./middlewares/errorHandler');
const Scheduler = require('./jobs/scheduler');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.use('/api/v1/feeds', feedRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);

// Error handling
app.use(errorHandler);

// Initialize scheduler
Scheduler.init();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`RSS Reader running on port ${PORT}`);
});

module.exports = app;