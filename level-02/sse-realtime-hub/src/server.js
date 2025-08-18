const express = require('express');
const cors = require('cors');
const bus = require('./bus');
const { PORT, API_KEY, HEARTBEAT_MS } = require('./config');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Utility: auth middleware for publishing endpoints
function requireApiKey(req, res, next) {
  const key = req.header('x-api-key');
  if (!key || key !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: invalid API key' });
  }
  next();
}

/**
 * SSE endpoint
 * Subscribe to a channel. Supports Last-Event-ID for replay.
 *
 * - GET /events?channel=<name>           (default "global")
 * - GET /events/:channel
 */
app.get(['/events', '/events/:channel'], (req, res) => {
  const channel = (req.params.channel || req.query.channel || 'global').toString();

  // SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    // CORS may be handled by middleware, but explicit for proxies:
    'Access-Control-Allow-Origin': '*'
  });

  // Suggest client retry in case of disconnect
  const retry = 3000;

  // Handle replay
  const lastEventIdHeader = req.header('Last-Event-ID');
  const replayAfterId = lastEventIdHeader ? parseInt(lastEventIdHeader, 10) : undefined;

  // Initial comment (useful to verify connection)
  res.write(`: connected to channel "${channel}"\n\n`);

  // Heartbeat to keep connections alive through proxies
  const hb = setInterval(() => {
    res.write(`: ping ${Date.now()}\n\n`);
  }, HEARTBEAT_MS);

  const unsubscribe = bus.subscribe(channel, res, { replayAfterId, retry });

  req.on('close', () => {
    clearInterval(hb);
    unsubscribe();
  });
});

/**
 * Publish an event to a channel
 * POST /publish
 * body: { channel: "orders/123", event?: "status", data: any }
 * header: x-api-key: <API_KEY>
 */
app.post('/publish', requireApiKey, (req, res) => {
  const { channel = 'global', event = 'message', data = {} } = req.body || {};
  try {
    const record = bus.publish(String(channel), { event: String(event), data });
    res.status(202).json({ ok: true, record });
  } catch (e) {
    res.status(400).json({ ok: false, error: e.message });
  }
});

/**
 * Demo simulator: emits fake updates to a channel
 * POST /simulate
 * body: { channel: "orders/123", count?: 5, delayMs?: 1000 }
 * header: x-api-key: <API_KEY>
 */
app.post('/simulate', requireApiKey, async (req, res) => {
  const { channel = 'orders/demo', count = 5, delayMs = 1000 } = req.body || {};
  res.json({ ok: true, message: `Simulating ${count} events on ${channel}` });

  const steps = [
    'queued',
    'processing',
    'packing',
    'out_for_delivery',
    'delivered'
  ];

  for (let i = 0; i < count; i++) {
    const status = steps[i % steps.length];
    bus.publish(String(channel), {
      event: 'status',
      data: {
        status,
        step: i + 1,
        total: count,
        at: new Date().toISOString()
      }
    });
    await new Promise((r) => setTimeout(r, delayMs));
  }
});

/**
 * Stats/health
 */
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'sse-realtime-hub',
    uptimeSec: Math.round(process.uptime())
  });
});

app.get('/stats', (_req, res) => {
  res.json({ ok: true, channels: bus.getStats() });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`SSE hub listening on http://localhost:${PORT}`);
});
