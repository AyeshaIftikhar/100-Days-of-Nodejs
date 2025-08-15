const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const scrapeRoutes = require('./routes/scrapeRoutes');
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
app.use('/api/v1/scrape', scrapeRoutes);

// Initialize scheduler
Scheduler.init();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Web scraper running on port ${PORT}`);
  console.log("Running on http://localhost:" + PORT);
  console.log("Press Ctrl+C to stop the server");
});

module.exports = app;