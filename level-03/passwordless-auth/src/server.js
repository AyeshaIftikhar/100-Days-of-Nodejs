import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { rateLimit } from './middleware/rateLimit.js';
import './db.js'; // Ensure DB/tables are initialized
import { authRouter } from './routes/auth.routes.js';
import { userRouter } from './routes/user.routes.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(rateLimit());

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/auth', authRouter);
app.use('/api', userRouter);

app.get('/health', (req, res) => {
  res.json({ ok: true, env: config.env });
});

app.listen(config.port, () => {
  console.log(`\n🚀 Passwordless Auth running on ${config.appUrl} (env: ${config.env})`);
});
