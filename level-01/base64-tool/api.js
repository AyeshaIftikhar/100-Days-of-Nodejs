const express = require('express');
const bodyParser = require('body-parser');
const Base64Encoder = require('./lib/encoder');
const FileHandler = require('./lib/fileHandler');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(bodyParser.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Encode endpoint
app.post('/api/encode', limiter, (req, res) => {
  try {
    const { text, urlSafe } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const encoded = Base64Encoder.encode(text, urlSafe);
    res.json({ encoded });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Decode endpoint
app.post('/api/decode', limiter, (req, res) => {
  try {
    const { encoded, urlSafe } = req.body;
    if (!encoded) {
      return res.status(400).json({ error: 'Encoded string is required' });
    }
    const decoded = Base64Encoder.decode(encoded, urlSafe);
    res.json({ decoded });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// File encode endpoint
app.post('/api/encode/file', limiter, async (req, res) => {
  try {
    // In a real app, you'd use multer for file uploads
    const { filePath, urlSafe } = req.body;
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }
    const encoded = await FileHandler.encodeFile(filePath, null, urlSafe);
    res.json({ encoded });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// File decode endpoint
app.post('/api/decode/file', limiter, async (req, res) => {
  try {
    const { filePath, urlSafe } = req.body;
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }
    const decoded = await FileHandler.decodeFile(filePath, null, urlSafe);
    res.json({ decoded });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoints:`);
  console.log(`- POST /api/encode`);
  console.log(`- POST /api/decode`);
  console.log(`- POST /api/encode/file`);
  console.log(`- POST /api/decode/file`);
});