const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const kong = require('./kongClient');
const tyk = require('./tykClient');

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());

// Health
app.get('/', (req, res) => res.json({ ok: true, service: 'api-gateway-manager' }));

/**
 * Register a service + route in Kong
 * POST /kong/register
 * body: { name, upstream_url, routes: [{ name, paths, methods }] }
 */
app.post('/kong/register', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.name || !payload.upstream_url) {
      return res.status(400).json({ error: 'name and upstream_url are required' });
    }

    const service = await kong.createService(payload.name, payload.upstream_url);
    const routes = [];

    if (Array.isArray(payload.routes)) {
      for (const r of payload.routes) {
        const route = await kong.createRoute(service.id, {
          name: r.name || `${payload.name}-route`,
          paths: r.paths || ['/'],
          methods: r.methods || []
        });
        routes.push(route);
      }
    }

    return res.json({ service, routes });
  } catch (err) {
    console.error('Kong register error', err?.response?.data || err.message || err);
    return res.status(500).json({ error: 'failed to register service in Kong', details: err?.message || err });
  }
});

app.get('/kong/services', async (req, res) => {
  try {
    const services = await kong.listServices();
    res.json({ data: services });
  } catch (err) {
    res.status(500).json({ error: err.message || 'failed to list services' });
  }
});

app.delete('/kong/service/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const result = await kong.deleteServiceByName(name);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message || 'failed to delete service' });
  }
});

//
// Tyk endpoints (scaffolded): create policy + API in Tyk
//
app.post('/tyk/register', async (req, res) => {
  try {
    const result = await tyk.registerAPI(req.body);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message || 'tyk register failed' });
  }
});

module.exports = app;
