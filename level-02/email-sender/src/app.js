const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const emailRoutes = require('./routes/emailRoutes');
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
app.use('/api/v1/emails', emailRoutes);

// Initialize scheduled jobs
Scheduler.init();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Email sender running on port ${PORT}`);
});

module.exports = app;