// src/index.js
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(morgan('dev'));
app.use(bodyParser.json());

// routes
const documents = require('./routes/documents');
app.use('/documents', documents);

// health
app.get('/', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(port, () => {
  console.log(`elastic-node-search running on port ${port}`);
});
