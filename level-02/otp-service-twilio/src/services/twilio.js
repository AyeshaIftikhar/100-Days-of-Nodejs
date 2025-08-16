const config = require('../config');
const Twilio = require('twilio');

if (!config.twilio.accountSid || !config.twilio.authToken) {
  console.warn('[twilio] Missing credentials. OTP sending will fail until set.');
}

const client = config.twilio.accountSid && config.twilio.authToken
  ? Twilio(config.twilio.accountSid, config.twilio.authToken)
  : null;

/**
 * Send an OTP via SMS or WhatsApp using Twilio.
 * channel: 'sms' | 'whatsapp'
 * phone: E.164 format (e.g. +923001234567)
 */
async function sendOtp({ channel, phone, message }) {
  if (!client) {
    throw new Error('Twilio client not configured.');
  }

  const opts = {
    to: channel === 'whatsapp' ? `whatsapp:${phone}` : phone,
    body: message,
  };

  // Prefer Messaging Service SID if present
  if (config.twilio.messagingServiceSid) {
    opts.messagingServiceSid = config.twilio.messagingServiceSid;
  } else if (config.twilio.from) {
    opts.from = channel === 'whatsapp'
      ? `whatsapp:${config.twilio.from}`
      : config.twilio.from;
  } else {
    throw new Error('Provide TWILIO_MESSAGING_SERVICE_SID or TWILIO_FROM');
  }

  const res = await client.messages.create(opts);
  return res.sid;
}

module.exports = { sendOtp };
