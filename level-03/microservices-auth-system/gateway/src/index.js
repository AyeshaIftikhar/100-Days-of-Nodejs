import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import { jwtMiddleware } from './jwt-mw.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ ok: true, service: 'gateway' }));

// Public auth proxies
app.use('/auth', authRoutes);

// Protected users
app.use('/users', jwtMiddleware, userRoutes);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`[gateway] listening on ${port}`));
