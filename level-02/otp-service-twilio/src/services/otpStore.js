/**
 * OTP storage with two backends:
 *  - Redis (production) using ioredis
 *  - In-memory Map (dev/testing)
 *
 * Stored value example:
 * {
 *   hash: "<hashed_otp>",
 *   expiresAt: 1730000000000, // ms
 *   attempts: 0,
 *   lastSentAt: 1730000000000 // for resend cooldowns
 * }
 */

const Redis = require('ioredis');
const config = require('../config');

class InMemoryStore {
  constructor() {
    this.map = new Map();
  }

  async set(phone, data, ttlSeconds) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    const value = { ...data, expiresAt };
    this.map.set(phone, value);
    setTimeout(() => this.map.delete(phone), ttlSeconds * 1000);
  }

  async get(phone) {
    const v = this.map.get(phone);
    if (!v) return null;
    if (Date.now() > v.expiresAt) {
      this.map.delete(phone);
      return null;
    }
    return v;
  }

  async del(phone) {
    this.map.delete(phone);
  }

  async update(phone, partial) {
    const v = await this.get(phone);
    if (!v) return null;
    const newV = { ...v, ...partial };
    this.map.set(phone, newV);
    return newV;
  }
}

class RedisStore {
  constructor(redisUrl) {
    this.client = new Redis(redisUrl);
  }

  async set(phone, data, ttlSeconds) {
    const payload = JSON.stringify(data);
    await this.client.set(phone, payload, 'EX', ttlSeconds);
  }

  async get(phone) {
    const payload = await this.client.get(phone);
    if (!payload) return null;
    try {
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }

  async del(phone) {
    await this.client.del(phone);
  }

  async update(phone, partial) {
    const current = await this.get(phone);
    if (!current) return null;
    const updated = { ...current, ...partial };
    const ttl = await this.client.ttl(phone);
    // ttl may be -1/-2; handle gracefully:
    const ttlSeconds = ttl > 0 ? ttl : 60;
    await this.set(phone, updated, ttlSeconds);
    return updated;
  }
}

function createOtpStore() {
  if (config.redisUrl) {
    return new RedisStore(config.redisUrl);
  }
  return new InMemoryStore();
}

module.exports = createOtpStore;
