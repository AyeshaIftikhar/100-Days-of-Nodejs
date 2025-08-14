const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const { logLevel } = require('./config');
const healthRoutes = require('./routes/healthRoutes');
const cacheRoutes = require('./routes/cacheRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan(logLevel));

app.use('/', healthRoutes);
app.use('/', cacheRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = app;
