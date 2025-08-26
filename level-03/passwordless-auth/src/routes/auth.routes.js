import express from 'express';
import { startLogin, verifyTokenOrCode } from '../auth.js';
import { config } from '../config.js';

export const authRouter = express.Router();

// Start login: send magic link + code
authRouter.post('/start', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }
    await startLogin({ email, ip: req.ip, ua: req.get('user-agent') });
    res.json({ ok: true, message: 'Check your email for a sign-in link and code.' });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to start login' });
  }
});

// Verify using magic link token or 6-digit code
authRouter.post('/verify', async (req, res) => {
  try {
    const { token, code } = req.body;
    if (!token && !code) return res.status(400).json({ error: 'Provide token or code' });
    const { jwt, user } = await verifyTokenOrCode({ token, code, ip: req.ip, ua: req.get('user-agent') });

    res.cookie(config.jwt.cookieName, jwt, {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.env === 'production',
      signed: false, // you may set to true if you also configure cookie-parser with a secret
      domain: config.jwt.cookieDomain,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ ok: true, user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Verification failed' });
  }
});

// Magic link GET handler (for link clicks)
authRouter.get('/verify', async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).send('Missing token');
  try {
    const { jwt, user } = await verifyTokenOrCode({ token, ip: req.ip, ua: req.get('user-agent') });

    res.cookie(config.jwt.cookieName, jwt, {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.env === 'production',
      domain: config.jwt.cookieDomain,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Redirect to a friendly page
    res.redirect('/verify.html?success=1&email=' + encodeURIComponent(user.email));
  } catch (err) {
    res.redirect('/verify.html?error=' + encodeURIComponent(err.message));
  }
});

// Logout
authRouter.post('/logout', (req, res) => {
  res.clearCookie(config.jwt.cookieName, { domain: config.jwt.cookieDomain });
  res.json({ ok: true });
});
