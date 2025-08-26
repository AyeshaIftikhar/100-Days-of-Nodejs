# Passwordless Auth (Magic Link + OTP)

A production-ready, **passwordless authentication** service using Node.js, Express, SQLite (via better-sqlite3), Nodemailer, and JWT **HttpOnly cookies**. Users sign in via **magic link** or **6‑digit code** sent to email. No passwords to forget or leak.

## Why this solves a real problem
- **Fewer support tickets**: Users don’t reset passwords or get locked out.
- **Better security**: No password storage, no reuse across sites.
- **Frictionless UX**: One tap on a magic link from any device.

## Features
- Magic link sign-in + 6‑digit backup code
- One-time tokens with expiry (default 15 min)
- HttpOnly JWT session cookie
- Email rate‑limiting per IP and per email (daily)
- Dev-friendly email previews (saved to `tmp/` and logged to console) if SMTP isn’t configured
- Minimal demo UI (`public/`) and JSON API (`/auth/*`, `/api/me`)
- SQLite database auto-initialized (stored at `data/app.db`)

## Quick Start

### 1) Clone & Install
```bash
npm i
```

### 2) Configure Environment
Copy `.env.example` to `.env` and adjust if needed:
```bash
cp .env.example .env
```
- For local/dev, you can leave SMTP blank to write email previews to `tmp/` and console.
- For real email sending, set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `MAIL_FROM`.

### 3) Run
```bash
npm run dev
# or
npm start
```
Visit: `http://localhost:3000`

## API

### POST `/auth/start`
Request body:
```json
{ "email": "you@example.com" }
```
Response:
```json
{ "ok": true, "message": "Check your email for a sign-in link and code." }
```

### POST `/auth/verify`
Provide either `token` (from magic link) **or** `code` (6 digits):
```json
{ "token": "..." }
```
**or**
```json
{ "code": "123456" }
```
Response sets an HttpOnly cookie and returns the user:
```json
{ "ok": true, "user": { "id": 1, "email": "you@example.com" } }
```

### GET `/api/me`
Requires session cookie; responds with current user.

### POST `/auth/logout`
Clears session cookie.

## Implementation Notes
- **DB**: `better-sqlite3` for zero-config local persistence.
- **Tokens**: Stored server-side, one-time use, expire after TTL; lookup by exact token or latest unconsumed matching code.
- **Session**: JWT signed with `JWT_SECRET`, stored in HttpOnly cookie (set `secure` in production).
- **Rate limiting**: In-memory per-IP window + per-email daily cap (use Redis in production).
- **Security**: Helmet headers, input validation, no plaintext passwords.

## Deploying
- Set `NODE_ENV=production` and use a proper `APP_URL` (e.g., `https://auth.yourapp.com`).
- Use a reverse proxy/Ingress that terminates TLS.
- Set strong `JWT_SECRET` and a proper `COOKIE_DOMAIN` for your site.
- Replace in-memory rate limiter with Redis for horizontal scalability.

## Folder Structure
```
src/
  server.js           # Express app + middleware
  config.js           # Env config
  db.js               # SQLite init and queries
  mailer.js           # Nodemailer transport (SMTP or file/console)
  tokens.js           # token + JWT helpers
  auth.js             # startLogin + verify logic
  middleware/
    rateLimit.js      # simple per-IP limiter (replace with Redis in prod)
    authRequired.js   # session guard
  routes/
    auth.routes.js    # /auth endpoints
    user.routes.js    # /api/me
  utils/emailTemplates.js
public/
  index.html          # demo UI
  verify.html         # redirect landing for magic link
```

## Testing without SMTP
- Start the app and request a login to your email.
- Check the console for a line like `Preview saved: tmp/mail-XXXXXXXX.eml`.
- Open the `.eml` file in any mail client, or open the file and copy the `https://.../auth/verify?token=...` link into your browser.
- Alternatively, use the 6‑digit code shown in the email body.

## Future Enhancements
- **WebAuthn (Passkeys)**: Offer device-bound sign-in after first email verification.
- **Branded Emails**: Add MJML or React Email templates.
- **Admin UI**: Token logs, abuse monitoring, user directory.
- **Multi-tenant**: Add `tenant_id` to tables and isolate domains.
- **SMS OTP**: Twilio/MessageBird for phone-based codes.
- **Audit trails**: IP/UA anomaly detection, email verification stats.
- **Rate limit backend**: Use Redis + sliding window algorithm.

## License
MIT
