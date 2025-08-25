import { Router } from 'express';
import axios from 'axios';
const router = Router();
const USER_URL = process.env.USER_SERVICE_URL || 'http://localhost:4002';

router.get('/me', async (req, res) => {
  try {
    const { data } = await axios.get(`${USER_URL}/me`, { headers: { 'x-user-id': req.user.sub } });
    res.json(data);
  } catch (e) {
    res.status(e.response?.status || 500).json(e.response?.data || { error: 'User service error' });
  }
});

router.patch('/me', async (req, res) => {
  try {
    const { data } = await axios.patch(`${USER_URL}/me`, req.body, { headers: { 'x-user-id': req.user.sub } });
    res.json(data);
  } catch (e) {
    res.status(e.response?.status || 500).json(e.response?.data || { error: 'User service error' });
  }
});

// Admin-only listing (gateway-side RBAC)
router.get('/', requireRole('admin'), proxyGet('/users'));
router.get('/:id', requireSelfOrAdmin, proxyGet('/users/:id'));

function requireRole(role) {
  return (req, res, next) => {
    const roles = req.user.roles || [];
    if (!roles.includes(role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

function requireSelfOrAdmin(req, res, next) {
  const roles = req.user.roles || [];
  if (roles.includes('admin')) return next();
  if (req.params.id === req.user.sub) return next();
  return res.status(403).json({ error: 'Forbidden' });
}

function proxyGet(path) {
  return async (req, res) => {
    try {
      const url = USER_URL + interpolate(path, req.params);
      const { data } = await axios.get(url);
      res.json(data);
    } catch (e) {
      res.status(e.response?.status || 500).json(e.response?.data || { error: 'User service error' });
    }
  };
}

function interpolate(path, params) {
  let p = path;
  for (const [k, v] of Object.entries(params || {})) p = p.replace(`:${k}`, v);
  return p;
}

export default router;
