import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { HttpProxyAgent } from 'http-proxy-agent';

export function buildHttpClient({ timeout = 10000, userAgent = 'ProxyPulse/1.0', proxyUrl = null } = {}) {
  const headers = { 'User-Agent': userAgent };
  const agent = proxyUrl
    ? (proxyUrl.startsWith('https:') ? new HttpsProxyAgent(proxyUrl) : new HttpProxyAgent(proxyUrl))
    : undefined;

  const instance = axios.create({
    timeout,
    headers,
    httpAgent: agent,
    httpsAgent: agent,
    maxRedirects: 10,
    validateStatus: () => true, // we handle non-2xx explicitly
  });

  return instance;
}
