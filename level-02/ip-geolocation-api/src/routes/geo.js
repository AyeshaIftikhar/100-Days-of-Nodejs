const express = require('express');
const router = express.Router();
const geoService = require('../services/geoService');

/**
 * GET /api/geo?ip=<ip>
 * If ip is omitted, uses the request IP (x-forwarded-for or req.ip)
 */
router.get('/geo', async (req, res, next) => {
  try {
    const ip = req.query.ip || req.headers['x-forwarded-for'] || req.ip;
    const result = await geoService.lookup(ip);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/me
 * Lookup the origin IP of the request
 */
router.get('/me', async (req, res, next) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.ip;
    const result = await geoService.lookup(ip);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
