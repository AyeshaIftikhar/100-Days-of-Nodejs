import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ ok: true, service: 'auth-service' }));
app.use('/', authRoutes);

const port = process.env.PORT || 4001;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(port, () => console.log(`[auth-service] listening on ${port}`));
  })
  .catch((e) => {
    console.error('Mongo connection error', e);
    process.exit(1);
  });
