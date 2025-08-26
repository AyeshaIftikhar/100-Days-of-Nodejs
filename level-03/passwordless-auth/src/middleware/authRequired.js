import { config } from '../config.js';
import jwt from 'jsonwebtoken';

export function authRequired(req, res, next) {
  const token = req.signedCookies?.[config.jwt.cookieName] || req.cookies?.[config.jwt.cookieName];
  if (!token) return res.status(401).json({ error: 'Unauthenticated' });
  try {
    const payload = jwt.verify(token, config.jwt.secret);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid session' });
  }
}
