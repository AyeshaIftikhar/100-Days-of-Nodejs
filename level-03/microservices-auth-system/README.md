# Microservices Auth System (Node.js)

A containerized microservices authentication system using Node.js, Express, MongoDB and JWT (RS256 access tokens + HMAC refresh tokens).

Services:
- Gateway (8080): reverse proxy + token validation
- Auth service (4001): register, login, refresh, logout, email verify, reset password
- User service (4002): user profile CRUD
- MongoDB (27017)

## Quick start (Docker)
1. Copy `.env.example` → `.env` and fill keys (RSA private key & public key + refresh secret).
2. `docker compose up --build`
3. Health check: `http://localhost:8080/health`

## Running locally (no Docker)
- Start a local MongoDB instance.
- In each service folder, run `npm install` then `npm run dev`.

## Endpoints (via gateway)
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/verify-email/:token`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET /users/me` (requires Bearer token)
- `PATCH /users/me` (requires Bearer token)

## Future Enhancements
- Integrate an email provider (SES / SendGrid) and background job queue.
- Device-bound refresh tokens and revocation lists.
- Social login (OAuth2), SSO (OIDC).
- Rate limiting & IP anomaly detection.
- Kubernetes + service mesh for production deployment.
