import express from 'express';
import { authRequired } from '../middleware/authRequired.js';

export const userRouter = express.Router();

userRouter.get('/me', authRequired, (req, res) => {
  res.json({ user: req.user });
});
