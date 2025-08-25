import { Router } from 'express';
import axios from 'axios';
const router = Router();
const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';

router.post('/register', proxy('post', '/register'));
router.post('/login', proxy('post', '/login'));
router.post('/refresh', proxy('post', '/refresh'));
router.post('/logout', proxy('post', '/logout'));
router.get('/verify-email/:token', proxy('get', '/verify-email/:token'));
router.post('/forgot-password', proxy('post', '/forgot-password'));
router.post('/reset-password', proxy('post', '/reset-password'));

function proxy(method, path) {
  return async (req, res) => {
    try {
      const url = AUTH_URL + interpolate(path, req.params);
      const { data, status } = await axios({ method, url, data: req.body });
      res.status(status).json(data);
    } catch (err) {
      const status = err.response?.status || 500;
      res.status(status).json(err.response?.data || { error: 'Auth service error' });
    }
  };
}

function interpolate(path, params) {
  let p = path;
  for (const [k, v] of Object.entries(params || {})) {
    p = p.replace(`:${k}`, v);
  }
  return p;
}

export default router;
