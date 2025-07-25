const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const pdfRoutes = require('./routes/pdfRoutes');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/v1/pdf', pdfRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`PDF Generator running on port ${PORT}`);
});

module.exports = app;