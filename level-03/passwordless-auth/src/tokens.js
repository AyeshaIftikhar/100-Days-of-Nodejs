import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from './config.js';

export function generateRandomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function generate6DigitCode() {
  // RFC 6238 style not required; simple 6-digit numeric code
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function signSession(user) {
  return jwt.sign({ sub: user.id, email: user.email }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
}

export function verifySession(token) {
  return jwt.verify(token, config.jwt.secret);
}
