require('dotenv').config();
const express = require('express');
const pino = require('pino');
const { v4: uuidv4 } = require('uuid');

const cache = require('./lib/cache');
const scheduler = require('./lib/scheduler');
const lock = require('./lib/lock');

const logger = pino();
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

/**
 * Health
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

/**
 * Cache endpoints
 */
app.get('/cache/:key', async (req, res) => {
  const key = req.params.key;
  try {
    const value = await cache.get(key);
    if (value === null) return res.status(404).json({ key, value: null });
    res.json({ key, value: JSON.parse(value) });
  } catch (err) {
    logger.error(err, 'GET cache error');
    res.status(500).json({ error: 'internal' });
  }
});

app.post('/cache', async (req, res) => {
  const { key, value, ttl } = req.body;
  if (!key || value === undefined) return res.status(400).json({ error: 'key and value required' });
  try {
    await cache.set(key, JSON.stringify(value), ttl);
    res.json({ ok: true, key });
  } catch (err) {
    logger.error(err, 'SET cache error');
    res.status(500).json({ error: 'internal' });
  }
});

/**
 * Schedule a job
 * body: { name, payload, schedule: { cron, everyInMs }, opts: { repeat: ... } }
 * - To create one-off job: omit repeat/cron and use runAt (timestamp)
 */
app.post('/schedule', async (req, res) => {
  const { name, payload = {}, cron, everyInMs, runAt } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  try {
    const jobId = uuidv4();
    const meta = { name, payload, jobId };

    if (runAt) {
      await scheduler.addOneOff(jobId, name, payload, { runAt });
      return res.json({ ok: true, scheduled: 'one-off', jobId });
    }

    if (cron) {
      await scheduler.addRecurring(jobId, name, payload, { cron });
      return res.json({ ok: true, scheduled: 'cron', jobId });
    }

    if (everyInMs) {
      await scheduler.addRecurring(jobId, name, payload, { everyInMs });
      return res.json({ ok: true, scheduled: 'every', jobId });
    }

    // default: immediate
    await scheduler.addImmediate(jobId, name, payload);
    res.json({ ok: true, scheduled: 'immediate', jobId });
  } catch (err) {
    logger.error(err, 'schedule error');
    res.status(500).json({ error: 'internal' });
  }
});

/**
 * Example endpoint demonstrating a distributed lock usage
 */
app.post('/refresh-cache-with-lock', async (req, res) => {
  const { key } = req.body;
  if (!key) return res.status(400).json({ error: 'key required' });

  const lockKey = `locks:refresh:${key}`;
  let lockResource;
  try {
    lockResource = await lock.acquire(lockKey, 5000); // 5 sec
    if (!lockResource) {
      return res.status(423).json({ error: 'could-not-acquire-lock' });
    }

    // Simulate expensive refresh (or call a job)
    const fresh = { refreshedAt: new Date().toISOString(), value: Math.random() };
    await cache.set(key, JSON.stringify(fresh), 60);
    res.json({ ok: true, key, fresh });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  } finally {
    if (lockResource) {
      try { await lock.release(lockResource); } catch (e) { /* ignore */ }
    }
  }
});

app.listen(PORT, async () => {
  console.log(`App listening at http://0.0.0.0:${PORT}`);
  await scheduler.init(); // ensures queue/worker connections ready
});
