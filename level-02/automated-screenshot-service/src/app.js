import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import screenshotRouter from './routes/screenshot.routes.js';
import { rateLimiter } from './middleware/rateLimit.js';
import { authIfConfigured } from './middleware/auth.js';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.js';
import config from './config/index.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.isDev ? 'dev' : 'combined'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputsPath = path.resolve(__dirname, '..', '..', config.OUTPUT_DIR || 'storage/outputs');

app.use('/files', express.static(outputsPath));

app.get('/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime(), env: config.NODE_ENV });
});

app.use('/api', rateLimiter);
app.use('/api', authIfConfigured, screenshotRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
