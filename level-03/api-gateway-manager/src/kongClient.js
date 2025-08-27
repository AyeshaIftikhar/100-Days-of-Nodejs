const axios = require('axios');
const urljoin = require('url').resolve;

const KONG_ADMIN = process.env.KONG_ADMIN_URL || 'http://localhost:8001';
const client = axios.create({
  baseURL: KONG_ADMIN,
  timeout: 5000
});

async function createService(name, url) {
  // Kong expects { name, url }
  const payload = { name, url };
  const res = await client.post('/services', payload);
  return res.data;
}

async function createRoute(serviceIdOrName, route) {
  // route: { name, paths, methods }
  const payload = {
    name: route.name,
    paths: route.paths,
  };
  if (route.methods && route.methods.length) payload.methods = route.methods;
  // POST /services/{service}/routes
  const res = await client.post(`/services/${serviceIdOrName}/routes`, payload);
  return res.data;
}

async function listServices() {
  const res = await client.get('/services');
  return res.data.data || res.data;
}

async function deleteServiceByName(name) {
  // find service first
  const services = await listServices();
  const svc = services.find(s => s.name === name || s.id === name);
  if (!svc) return { ok: false, reason: 'service-not-found' };
  await client.delete(`/services/${svc.id}`);
  return { ok: true, id: svc.id };
}

module.exports = {
  createService,
  createRoute,
  listServices,
  deleteServiceByName
};
