const express = require('express');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { generateOtpCode, hashOtp, safeEqual } = require('../utils/otp');
const createOtpStore = require('../services/otpStore');
const { sendOtp } = require('../services/twilio');

const router = express.Router();
const store = createOtpStore();

const phoneSchema = Joi.object({
  phone: Joi.string().pattern(/^\+\d{7,15}$/).required(),
  channel: Joi.string().valid('sms', 'whatsapp').default('sms'),
});

const verifySchema = Joi.object({
  phone: Joi.string().pattern(/^\+\d{7,15}$/).required(),
  code: Joi.string().length(6).pattern(/^\d+$/).required(),
});

/**
 * POST /auth/request-otp
 * body: { phone: "+923001234567", channel?: "sms"|"whatsapp" }
 */
router.post('/request-otp', async (req, res) => {
  try {
    const { value, error } = phoneSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const { phone, channel } = value;

    const existing = await store.get(phone);
    const now = Date.now();
    if (existing && existing.lastSentAt && now - existing.lastSentAt < config.otp.resendCooldown * 1000) {
      const secondsLeft = Math.ceil((config.otp.resendCooldown * 1000 - (now - existing.lastSentAt)) / 1000);
      return res.status(429).json({ error: `Please wait ${secondsLeft}s before requesting another OTP.` });
    }

    const code = generateOtpCode();
    const hash = hashOtp({ phone, code });

    const record = {
      hash,
      attempts: 0,
      lastSentAt: now,
    };

    await store.set(phone, record, config.otp.ttlSeconds);

    const message = `Your verification code is ${code}. It expires in ${Math.floor(config.otp.ttlSeconds / 60)} minutes.`;
    try {
      const sid = await sendOtp({ channel, phone, message });
      return res.json({
        status: 'sent',
        channel,
        phone,
        sid,
        ttlSeconds: config.otp.ttlSeconds,
        cooldownSeconds: config.otp.resendCooldown,
      });
    } catch (sendErr) {
      // Cleanup on send failure
      await store.del(phone);
      return res.status(502).json({ error: 'Failed to send OTP', details: sendErr.message });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * POST /auth/verify-otp
 * body: { phone: "+923001234567", code: "123456" }
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { value, error } = verifySchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const { phone, code } = value;

    const record = await store.get(phone);
    if (!record) return res.status(400).json({ error: 'Code expired or not found. Please request a new OTP.' });

    const attempts = (record.attempts || 0) + 1;
    if (attempts > config.otp.maxAttempts) {
      await store.del(phone);
      return res.status(429).json({ error: 'Too many attempts. Code invalidated. Please request a new OTP.' });
    }

    const candidateHash = hashOtp({ phone, code });
    const ok = safeEqual(candidateHash, record.hash);

    if (!ok) {
      await store.update(phone, { attempts });
      return res.status(400).json({ error: 'Invalid code', attempts, remaining: Math.max(config.otp.maxAttempts - attempts, 0) });
    }

    // Success → delete OTP and mint JWT
    await store.del(phone);

    const token = jwt.sign({ sub: phone, scope: ['basic'] }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
    return res.json({ status: 'verified', token, tokenExpiresIn: config.jwt.expiresIn });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
