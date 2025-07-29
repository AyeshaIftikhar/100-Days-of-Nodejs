const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const fileUpload = require('express-fileupload');
const encryptionRoutes = require('./routes/encryptionRoutes');
const fileRoutes = require('./routes/fileRoutes');
const errorHandler = require('./middlewares/errorHandler');
const StorageService = require('./services/storageService');

// Load environment variables
dotenv.config();

// Initialize storage
StorageService.initStorage().catch(err => {
  console.error('Failed to initialize storage:', err);
  process.exit(1);
});

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(fileUpload({
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 50 * 1024 * 1024 )},
  abortOnLimit: true,
  responseOnLimit: 'File size exceeds the limit',
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// Routes
app.use('/api/v1/encrypt', encryptionRoutes);
app.use('/api/v1/files', fileRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`File encryption tool running on port ${PORT}`);
});

module.exports = app;