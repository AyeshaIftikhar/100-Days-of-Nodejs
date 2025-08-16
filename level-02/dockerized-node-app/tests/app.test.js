const request = require('supertest');
const app = require('../src/app');

describe('Health Check', () => {
  it('should return status OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'OK');
  });
});

describe('Stock API', () => {
  it('should return error for missing symbol', async () => {
    const res = await request(app).get('/api/');
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});
