import { queries, getOrCreateUserByEmail, db } from './db.js';
import { config } from './config.js';
import { generateRandomToken, generate6DigitCode, signSession } from './tokens.js';
import { sendMail } from './mailer.js';
import { magicLinkEmail } from './utils/emailTemplates.js';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function incrementDailyEmailCounter(email) {
  const row = queries.countEmailToday.get(email);
  const today = todayStr();
  if (!row || row.day !== today) {
    queries.upsertEmailCounter.run(email, 1, today);
    return 1;
  }
  const next = (row.count || 0) + 1;
  queries.upsertEmailCounter.run(email, next, today);
  return next;
}

export async function startLogin({ email, ip, ua }) {
  const dailyCount = incrementDailyEmailCounter(email);
  if (dailyCount > config.rateLimit.emailDailyLimit) {
    const err = new Error('Daily email limit reached');
    err.status = 429;
    throw err;
  }

  const user = getOrCreateUserByEmail(email);
  const token = generateRandomToken(32);
  const code = generate6DigitCode();
  const expiresAt = new Date(Date.now() + config.tokens.ttlMinutes * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);

  queries.insertLoginToken.run(user.id, token, code, ip || null, ua || null, expiresAt);

  const link = `${config.appUrl}/auth/verify?token=${encodeURIComponent(token)}`;
  const { subject, html, text } = magicLinkEmail({
    appUrl: config.appUrl,
    email,
    link,
    code,
    ttlMinutes: config.tokens.ttlMinutes
  });

  await sendMail({ to: email, subject, html, text });
  return { ok: true };
}

export function verifyTokenOrCode({ token, code, ip, ua }) {
  let row = null;
  if (token) {
    row = queries.findToken.get(token);
  } else {
    // fallback: lookup by most recent matching code and not expired/consumed
    row = db.prepare(`SELECT * FROM login_tokens WHERE code = ? AND consumed_at IS NULL AND datetime(expires_at) > datetime('now') ORDER BY id DESC LIMIT 1`).get(code);
  }

  if (!row) {
    const err = new Error('Invalid or expired token/code');
    err.status = 400;
    throw err;
  }

  // Check expiration and not already used
  const expired = new Date(row.expires_at + 'Z').getTime() < Date.now();
  if (expired) {
    const err = new Error('Token expired');
    err.status = 400;
    throw err;
  }
  if (row.consumed_at) {
    const err = new Error('Token already used');
    err.status = 400;
    throw err;
  }

  // consume token (one-time)
  queries.consumeToken.run(row.id);

  // create session
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(row.user_id);
  const jwt = signSession(user);
  return { jwt, user };
}
