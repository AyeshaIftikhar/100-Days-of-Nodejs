const crypto = require('crypto');
const config = require('../config');

/**
 * Generate a 6-digit OTP as a string (000000-999999).
 */
function generateOtpCode() {
  const code = Math.floor(Math.random() * 1000000);
  return code.toString().padStart(6, '0');
}

/**
 * HMAC-SHA256 hash the OTP (never store plaintext).
 * Combines code+phone to prevent reuse, plus a server-side pepper.
 */
function hashOtp({ phone, code }) {
  const hmac = crypto.createHmac('sha256', config.otp.hashSecret);
  hmos = hmac.update(`${phone}:${code}`).digest('hex');
  return hmos;
}

/**
 * Constant-time compare to avoid timing attacks.
 */
function safeEqual(a, b) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

module.exports = {
  generateOtpCode,
  hashOtp,
  safeEqual,
};
