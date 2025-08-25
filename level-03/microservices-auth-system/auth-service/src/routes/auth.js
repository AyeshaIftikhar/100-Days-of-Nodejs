import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import UserAuth from '../models/UserAuth.js';
import axios from 'axios';

const router = Router();

const ACCESS_PRIVATE = (process.env.ACCESS_TOKEN_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:4002';
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:8080';

function signAccessToken(user) {
  const payload = {
    sub: user.userId || String(user._id),
    email: user.email,
    roles: user.roles,
    emailVerified: user.emailVerified
  };
  return jwt.sign(payload, ACCESS_PRIVATE, { algorithm: 'RS256', expiresIn: '15m' });
}

function signRefreshToken() {
  return jwt.sign({ rid: nanoid(16) }, REFRESH_SECRET, { expiresIn: '30d' });
}

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email & password required' });
  const exists = await UserAuth.findOne({ email });
  if (exists) return res.status(409).json({ error: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 10);
  const emailVerifyToken = nanoid(40);

  // Create profile in user-service (internal endpoint)
  let profile = null;
  try {
    const r = await axios.post(`${USER_SERVICE_URL}/internal/users`, { email, name });
    profile = r.data;
  } catch (e) {
    // ignore — profile may be created later
  }

  const ua = await UserAuth.create({
    email,
    passwordHash,
    emailVerifyToken,
    userId: profile?.id,
    roles: ['user']
  });

  const verifyUrl = `${APP_BASE_URL}/auth/verify-email/${emailVerifyToken}`;
  res.status(201).json({ message: 'Registered. Verify your email.', verifyUrl });
});

router.get('/verify-email/:token', async (req, res) => {
  const ua = await UserAuth.findOne({ emailVerifyToken: req.params.token });
  if (!ua) return res.status(400).json({ error: 'Invalid token' });
  ua.emailVerified = true;
  ua.emailVerifyToken = undefined;
  await ua.save();
  res.json({ message: 'Email verified' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const ua = await UserAuth.findOne({ email });
  if (!ua) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, ua.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken = signAccessToken(ua);
  const refreshToken = signRefreshToken();
  ua.refreshTokens.push({ token: refreshToken, userAgent: req.headers['user-agent'], ip: req.ip });
  await ua.save();
  res.json({ accessToken, refreshToken, emailVerified: ua.emailVerified, userId: ua.userId, roles: ua.roles });
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });
  try {
    jwt.verify(refreshToken, REFRESH_SECRET);
  } catch (e) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
  const ua = await UserAuth.findOne({ 'refreshTokens.token': refreshToken });
  if (!ua) return res.status(401).json({ error: 'Unknown refresh token' });

  // Rotate
  ua.refreshTokens = ua.refreshTokens.filter((t) => t.token !== refreshToken);
  const newRefresh = signRefreshToken();
  ua.refreshTokens.push({ token: newRefresh });
  await ua.save();

  const accessToken = signAccessToken(ua);
  res.json({ accessToken, refreshToken: newRefresh });
});

router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });
  const ua = await UserAuth.findOne({ 'refreshTokens.token': refreshToken });
  if (!ua) return res.json({ message: 'Logged out' });
  ua.refreshTokens = ua.refreshTokens.filter((t) => t.token !== refreshToken);
  await ua.save();
  res.json({ message: 'Logged out' });
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const ua = await UserAuth.findOne({ email });
  if (!ua) return res.json({ message: 'If account exists, email sent' });
  ua.resetPasswordToken = nanoid(40);
  await ua.save();
  const resetUrl = `${APP_BASE_URL}/auth/reset-password?token=${ua.resetPasswordToken}`;
  res.json({ message: 'Password reset initiated', resetUrl });
});

router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  const ua = await UserAuth.findOne({ resetPasswordToken: token });
  if (!ua) return res.status(400).json({ error: 'Invalid token' });
  ua.passwordHash = await bcrypt.hash(newPassword, 10);
  ua.resetPasswordToken = undefined;
  await ua.save();
  res.json({ message: 'Password updated' });
});

export default router;
