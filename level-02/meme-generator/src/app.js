import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import memeRouter from './routes/meme.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security & common middleware
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: corsOrigin === '*' ? true : corsOrigin }));

// Logging
app.use(morgan('dev'));

// Rate limiting for API
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120, // 120 requests / minute
  message: { error: 'Rate limit exceeded. Try again later.' },
});
app.use('/api/', apiLimiter);

// Public static site (demo form)
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/meme', memeRouter);

// Root: serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error', details: err?.message });
});

export default app;
