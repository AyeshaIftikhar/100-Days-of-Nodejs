import config from '../config/index.js';

export function authIfConfigured(req, res, next) {
  if (!config.AUTH_TOKEN) return next();
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (token === config.AUTH_TOKEN) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}
