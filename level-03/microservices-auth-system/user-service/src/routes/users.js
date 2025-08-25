import { Router } from 'express';
import User from '../models/User.js';

const router = Router();

// internal create (called by auth-service)
router.post('/internal/users', async (req, res) => {
  const { email, name } = req.body;
  let u = await User.findOne({ email });
  if (!u) u = await User.create({ email, name });
  res.status(201).json({ id: String(u._id), email: u.email, name: u.name });
});

// current user (x-user-id header from gateway)
router.get('/me', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(400).json({ error: 'x-user-id header required' });
  const u = await User.findById(userId);
  if (!u) return res.status(404).json({ error: 'Not found' });
  res.json(sanitize(u));
});

router.patch('/me', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(400).json({ error: 'x-user-id header required' });
  const u = await User.findByIdAndUpdate(userId, req.body, { new: true });
  if (!u) return res.status(404).json({ error: 'Not found' });
  res.json(sanitize(u));
});

// admin endpoints
router.get('/users', async (req, res) => {
  const list = await User.find().limit(100).lean();
  res.json(list.map(sanitize));
});

router.get('/users/:id', async (req, res) => {
  const u = await User.findById(req.params.id);
  if (!u) return res.status(404).json({ error: 'Not found' });
  res.json(sanitize(u));
});

function sanitize(u) {
  return { id: String(u._id), email: u.email, name: u.name, bio: u.bio, avatarUrl: u.avatarUrl };
}

export default router;
