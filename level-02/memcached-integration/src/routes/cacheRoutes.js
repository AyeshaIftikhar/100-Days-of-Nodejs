const express = require('express');
const Joi = require('joi');
const { get, set, del, flush } = require('../cache');
const { cacheDefaultTtl } = require('../config');
const { fib } = require('../utils/fib');

const router = express.Router();

const setSchema = Joi.object({
  key: Joi.string().min(1).required(),
  value: Joi.any().required(),
  ttl: Joi.number().integer().min(1).optional()
});

// GET /cache/:key
router.get('/cache/:key', async (req, res) => {
  try {
    const value = await get(req.params.key);
    if (value == null) return res.status(404).json({ error: 'Key not found' });
    res.json({ key: req.params.key, value });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /cache  { key, value, ttl? }
router.post('/cache', async (req, res) => {
  try {
    const { value, error } = setSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const ttl = value.ttl ?? cacheDefaultTtl;
    await set(value.key, value.value, ttl);
    res.status(201).json({ ok: true, key: value.key, ttl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /cache/:key
router.delete('/cache/:key', async (req, res) => {
  try {
    await del(req.params.key);
    res.json({ ok: true, key: req.params.key });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /cache/flush
router.post('/cache/flush', async (_req, res) => {
  try {
    await flush();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /fib/:n  — cached result demo
router.get('/fib/:n', async (req, res) => {
  const key = `fib:${req.params.n}`;
  try {
    let value = await get(key);
    if (value != null) {
      return res.json({ n: Number(req.params.n), value, cached: true });
    }
    // compute and set
    value = fib(req.params.n);
    // cache for 30 seconds
    await set(key, value, 30);
    res.json({ n: Number(req.params.n), value, cached: false });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
