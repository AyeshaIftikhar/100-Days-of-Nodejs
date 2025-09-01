// Very small smoke test that runs when user executes npm test (local Redis required)
const axios = require('axios');

(async () => {
  try {
    const base = process.env.BASE_URL || 'http://localhost:3000';
    console.log('Health:', (await axios.get(`${base}/health`)).data);
    const set = await axios.post(`${base}/cache`, { key: 'smoke', value: { ok: true }, ttl: 10 });
    console.log('Set:', set.data);
    const get = await axios.get(`${base}/cache/smoke`);
    console.log('Get:', get.data);
    console.log('Scheduling immediate job...');
    const job = await axios.post(`${base}/schedule`, { name: 'log-message', payload: { msg: 'hello' } });
    console.log('Schedule response:', job.data);
    console.log('Smoke test finished');
    process.exit(0);
  } catch (err) {
    console.error('Smoke test failed', err?.response?.data || err?.message);
    process.exit(1);
  }
})();
