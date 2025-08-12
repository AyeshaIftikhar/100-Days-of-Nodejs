const axios = require('axios');
const NodeCache = require('node-cache');

const CACHE_TTL = Number(process.env.CACHE_TTL_SECONDS) || 300;
const cache = new NodeCache({ stdTTL: CACHE_TTL, checkperiod: Math.floor(CACHE_TTL / 2) });

/**
 * Supported providers:
 * - ip-api (default): http://ip-api.com/json/{query}
 *   no API key required for basic usage (limited rate).
 *
 * You can extend this file to support ipinfo, ipstack, ipdata, etc. (some require API keys).
 */

async function lookup(ip) {
  // normalize IP (strip port if present)
  const normalized = (typeof ip === 'string') ? ip.split(',')[0].trim().replace(/^::ffff:/, '') : ip;

  // cache key
  const key = `geo:${normalized}`;
  const cached = cache.get(key);
  if (cached) return { source: 'cache', ip: normalized, data: cached };

  const provider = (process.env.GEODB_PROVIDER || 'ip-api').toLowerCase();

  if (provider === 'ip-api') {
    return lookupIpApi(normalized, key);
  }

  throw new Error(`Unsupported provider: ${provider}`);
}

async function lookupIpApi(ip, cacheKey) {
  try {
    // ip-api allows "json" with the IP or "json" for self
    const query = ip || '';
    const url = `http://ip-api.com/json/${encodeURIComponent(query)}?fields=status,message,country,regionName,city,zip,lat,lon,timezone,isp,org,as,query`;
    const resp = await axios.get(url, { timeout: 5000 });

    if (!resp.data) throw new Error('No response from provider');

    if (resp.data.status !== 'success') {
      const errMsg = resp.data.message || 'Lookup failed';
      const payload = { success: false, provider: 'ip-api', message: errMsg, ip };
      return payload;
    }

    const payload = {
      success: true,
      provider: 'ip-api',
      ip: resp.data.query,
      country: resp.data.country,
      region: resp.data.regionName,
      city: resp.data.city,
      postal: resp.data.zip,
      lat: resp.data.lat,
      lon: resp.data.lon,
      timezone: resp.data.timezone,
      isp: resp.data.isp,
      org: resp.data.org,
      as: resp.data.as
    };

    // store in cache
    cache.set(cacheKey, payload);

    return { source: 'provider', ...payload };
  } catch (err) {
    throw Object.assign(new Error('Failed to lookup IP'), { cause: err });
  }
}

module.exports = { lookup };
