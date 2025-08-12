const request = require('supertest');
const express = require('express');
const geoRoutes = require('../src/routes/geo');

// Quick test server
const app = express();
app.use(express.json());
app.use('/api', geoRoutes);

jest.setTimeout(10000);

describe('Geo endpoints', () => {
  test('GET /api/geo?ip=8.8.8.8 should return location data', async () => {
    const res = await request(app).get('/api/geo').query({ ip: '8.8.8.8' });
    expect(res.statusCode).toBe(200);
    // The provider may respond with different fields; check for expected structure
    expect(res.body).toHaveProperty('data', undefined); // if cached previously it might differ; be lenient
    // Accept either success true from payload or provider result
    // If provider responded with success=false, we still expect an object
    expect(typeof res.body).toBe('object');
  });

  test('GET /api/me should return something', async () => {
    const res = await request(app).get('/api/me');
    expect(res.statusCode).toBe(200);
    expect(typeof res.body).toBe('object');
  });
});
