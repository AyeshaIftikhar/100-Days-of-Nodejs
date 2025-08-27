const axios = require('axios');

const TYK_HOST = process.env.TYK_HOST || 'http://localhost:8080';
const TYK_AUTH_TOKEN = process.env.TYK_AUTH_TOKEN || '';

if (!TYK_AUTH_TOKEN) {
  console.warn('TYK_AUTH_TOKEN not set. Tyk endpoints will fail until you configure a valid token.');
}

const client = axios.create({
  baseURL: TYK_HOST,
  timeout: 6000,
  headers: {
    Authorization: TYK_AUTH_TOKEN,
    'x-tyk-authorization': TYK_AUTH_TOKEN
  }
});

/**
 * registerAPI(payload)
 * expected payload shape: { name, target_url, listen_path, version: "v1" }
 *
 * Tyk Dashboard API: POST /api/apis
 *
 * This function is a minimal scaffold and may require adapting for your Tyk installation.
 */
async function registerAPI(payload) {
  if (!TYK_AUTH_TOKEN) throw new Error('TYK_AUTH_TOKEN not configured');
  const apiPayload = {
    name: payload.name || 'sample-api',
    api_id: payload.api_id || `api-${Date.now()}`,
    org_id: payload.org_id || 'default',
    auth: {
      auth_header_name: 'Authorization'
    },
    version_data: {
      version: 'v1',
      not_versioned: true,
      // paths must include proxy
      proxy: {
        target_url: payload.target_url,
        listen_path: payload.listen_path || `/api/${payload.name}/`,
        strip_listen_path: true
      }
    }
  };

  const res = await client.post('/api/apis', apiPayload);
  return res.data;
}

module.exports = {
  registerAPI
};
