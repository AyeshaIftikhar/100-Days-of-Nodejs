import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkUrl } from './checkers/urlChecker.js';
import { checkVpnOrProxy } from './checkers/vpnChecker.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/default.json'), 'utf-8'));

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({
    name: 'ProxyPulse',
    version: '1.0.0',
    endpoints: {
      urlCheck: 'POST /api/check-url { "url": "https://example.com", "method": "GET" }',
      vpnCheck: 'GET /api/check-vpn'
    }
  });
});

app.post('/api/check-url', async (req, res) => {
  const { url, method } = req.body || {};
  if (!url) return res.status(400).json({ ok: false, error: 'url is required' });
  try {
    const result = await checkUrl(url, {
      timeout: Number(process.env.REQUEST_TIMEOUT || config.requestTimeout),
      userAgent: config.userAgent,
      proxyUrl: process.env.HTTPS_PROXY || process.env.HTTP_PROXY || null,
      method: method || 'GET'
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/check-vpn', async (_req, res) => {
  try {
    const result = await checkVpnOrProxy({
      ipApis: config.ipApis,
      vpnHeuristics: config.vpnHeuristics
    });
    res.json(result);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

const port = Number(process.env.PORT || config.port || 6060);
app.listen(port, () => {
  console.log(`ProxyPulse API running on http://localhost:${port}`);
});
