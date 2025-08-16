const request = require('supertest');
const handler = require('../../src/handlers/vercel.handler');

describe('Integration: /api/quote', () => {
  let server;

  beforeAll(() => {
    // Create a simple express server for integration testing
    const express = require('express');
    const app = express();
    app.get('/api/quote', handler);
    server = app.listen(4000);
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should return 400 for missing symbol', async () => {
    const res = await request(server).get('/api/quote');
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/required/);
  });

  it('should return 400 for invalid symbol', async () => {
    const res = await request(server).get('/api/quote?symbol=12345');
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/only letters/);
  });

  // You can add more tests for valid symbols if you mock AlphaVantage
});
