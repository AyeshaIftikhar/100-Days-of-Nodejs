import dns from 'node:dns/promises';
import { performance } from 'node:perf_hooks';
import { buildHttpClient } from '../utils/httpClient.js';

/**
 * Check URL reachability and gather diagnostics.
 * Options:
 * - timeout
 * - userAgent
 * - proxyUrl
 * - method
 */
export async function checkUrl(targetUrl, opts = {}) {
  const {
    timeout = 10000,
    userAgent = 'ProxyPulse/1.0',
    proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || null,
    method = 'GET',
  } = opts;

  const client = buildHttpClient({ timeout, userAgent, proxyUrl });

  // DNS resolve
  let dnsA = [], dnsAAAA = [], resolveError = null;
  try {
    const u = new URL(targetUrl);
    dnsA = await dns.resolve4(u.hostname);
    try { dnsAAAA = await dns.resolve6(u.hostname); } catch {}
  } catch (err) {
    resolveError = err.message;
  }

  // HTTP fetch
  const start = performance.now();
  let res, networkError = null;
  try {
    res = await client.request({ url: targetUrl, method });
  } catch (err) {
    networkError = err.message;
  }
  const elapsedMs = Math.round(performance.now() - start);

  const result = {
    ok: !!res && res.status >= 200 && res.status < 400,
    url: targetUrl,
    method,
    elapsedMs,
    dns: {
      A: dnsA,
      AAAA: dnsAAAA,
      resolveError
    },
    http: res ? {
      status: res.status,
      statusText: res.statusText,
      headers: res.headers,
      redirected: res.request?.res?.responseUrl && res.request.res.responseUrl !== targetUrl,
      finalUrl: res.request?.res?.responseUrl || targetUrl,
      contentLength: Number(res.headers['content-length']) || (typeof res.data === 'string' ? res.data.length : null)
    } : null,
    errors: {
      networkError
    },
    usedProxy: !!proxyUrl,
  };

  return result;
}
