import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import routes from './routes/users.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ ok: true, service: 'user-service' }));
app.use('/', routes);

const port = process.env.PORT || 4002;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(port, () => console.log(`[user-service] listening on ${port}`));
  })
  .catch((e) => {
    console.error('Mongo connection error', e);
    process.exit(1);
  });
