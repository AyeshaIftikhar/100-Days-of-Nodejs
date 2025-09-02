require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const expressLayouts = require('express-ejs-layouts');

const indexRoutes = require('./routes/index');
const apiRoutes = require('./routes/api');
const feedService = require('./services/feedService');

const PORT = process.env.PORT || 3000;

const app = express();

// Basic middleware
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set("layout extractScripts", true);

// Static assets
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRoutes);
app.use('/api', apiRoutes);

// Simple health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Start feeds pre-fetch (warm cache)
(async () => {
  try {
    await feedService.prefetchAll();
    app.listen(PORT, () => {
      console.log(`ServerNews SSR running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to prefetch feeds:', err);
    // Start server anyway
    app.listen(PORT, () => {
      console.log(`ServerNews SSR running on http://localhost:${PORT}`);
    });
  }
})();
