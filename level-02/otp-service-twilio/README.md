# OTP Service (Twilio) – Node.js

A production-ready OTP service using Twilio (SMS/WhatsApp) with secure OTP hashing, resend cooldowns, attempt limits, Redis/in-memory storage, JWT issuance, and a demo protected route.

## Features

- OTP via **SMS** or **WhatsApp** (Twilio)
- **HMAC-hashed** OTPs (no plaintext storage)
- **TTL**, **resend cooldown**, **max attempts**
- **Redis** backend (with in-memory fallback)
- **JWT** issuance after verification
- **Rate limiting**, **Helmet**, request logging
- Docker & docker-compose included

## Quick Start

### 1) Configure

Copy `.env.example` → `.env` and fill:

```bash
env
PORT=4000
JWT_SECRET=your_strong_secret
JWT_EXPIRES_IN=1h
OTP_TTL_SECONDS=300
OTP_RESEND_COOLDOWN=60
OTP_MAX_ATTEMPTS=5
OTP_HASH_SECRET=another_strong_secret

TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxx
TWILIO_MESSAGING_SERVICE_SID=MGxxxxxxxx
# or TWILIO_FROM=+1234567890

# Optional for production scaling:
REDIS_URL=redis://redis:6379
```

## Real-time Problem Flow (with sample cURL)

Scenario: Verify a user’s mobile number for login/signup using OTP via SMS/WhatsApp.

1. Request OTP

```json
curl -X POST http://localhost:4000/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+923001234567","channel":"sms"}'
```

Response:

```json
{
  "status": "sent",
  "channel": "sms",
  "phone": "+923001234567",
  "sid": "SMxxxxxxxxx",
  "ttlSeconds": 300,
  "cooldownSeconds": 60
}
```

For WhatsApp, use "channel": "whatsapp". Make sure your Twilio WhatsApp sandbox/business number is configured and the recipient is permitted.

2. Verify OTP

```bash
curl -X POST http://localhost:4000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+923001234567","code":"123456"}'
```

Response:

```json
{
  "status": "verified",
  "token": "<JWT>",
  "tokenExpiresIn": "1h"
}
```

3. Access a protected endpoint

```bash
curl http://localhost:4000/me \
  -H "Authorization: Bearer <JWT>"
```

Response:

```json
{
  "user": { "phone": "+923001234567", "scope": ["basic"] }
}
```

## API

- POST `/auth/request-otp`

Request a new OTP.

Body:

```json
{ "phone": "+923001234567", "channel": "sms" }
```

channel is sms or whatsapp (default sms)

- POST `/auth/verify-otp`

Verify OTP and receive a JWT.

Body:

```json
{ "phone": "+923001234567", "code": "123456" }
```

- GET `/me`

Protected sample endpoint.

- Header: Authorization: Bearer <JWT>

## Real-World Integration Ideas

- Passwordless login for your mobile app or web app
- Phone verification during signup and trusted-device marking
- Step-up authentication for risky transactions
- Number change verification inside user profile settings

## Notes

- Make sure your Twilio phone number or Messaging Service is enabled for SMS and/or WhatsApp as needed.
- For WhatsApp, you must configure a verified sender and recipient onboarding within Twilio.

## Future Enhancements

- **Templated messaging & i18n**: language-specific message content and RTL/LTR format.
- **TOTP option**: Allow RFC 6238-based TOTPs for app-based authenticators.
- **Device fingerprinting**: Reduce fraud on resend/verify with device metadata.
- **Per-user/IP adaptive limits**: Dynamic throttling based on behavior signals.
- **Brute-force protection**: Progressive backoff after multiple failed sessions.
- **Admin dashboard**: Monitor send rates, deliverability, and verification success.
- **Webhook receipts**: Track message delivery statuses from Twilio callbacks.
- **Observability**: OpenTelemetry tracing & metrics.
- **Test suite**: Add Jest + Supertest end-to-end tests and contract tests.
- **KMS/Secrets Manager**: Store secrets in AWS KMS/SSM or HashiCorp Vault.
