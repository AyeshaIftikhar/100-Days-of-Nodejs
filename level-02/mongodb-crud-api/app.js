const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./utils/errorResponse');
const connectDB = require('./config/db');
const productsRouter = require('./routes/products');

// Connect to database
connectDB();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/v1/products', productsRouter);

// Error handling middleware
app.use(errorHandler);

module.exports = app;