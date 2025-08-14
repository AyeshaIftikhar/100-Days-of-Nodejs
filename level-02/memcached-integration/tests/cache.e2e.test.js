const request = require('supertest');
const app = require('../src/app');

const MEMCACHED_AVAILABLE = !!process.env.MEMCACHED_SERVERS;

(MEMCACHED_AVAILABLE ? describe : describe.skip)('Cache E2E', () => {
  const key = 'test:key';
  const value = { hello: 'world' };

  test('POST /cache sets a value', async () => {
    const res = await request(app).post('/cache').send({ key, value, ttl: 10 });
    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);
  });

  test('GET /cache/:key retrieves the value', async () => {
    const res = await request(app).get(`/cache/${encodeURIComponent(key)}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.value).toEqual(value);
  });

  test('DELETE /cache/:key deletes the value', async () => {
    const res = await request(app).delete(`/cache/${encodeURIComponent(key)}`);
    expect(res.statusCode).toBe(200);
    const after = await request(app).get(`/cache/${encodeURIComponent(key)}`);
    expect(after.statusCode).toBe(404);
  });
});
