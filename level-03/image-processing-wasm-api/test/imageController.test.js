const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../src/server');

describe('Image Controller', () => {
  test('GET /api/images/operations should return available operations', async () => {
    const response = await request(app)
      .get('/api/images/operations')
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.operations)).toBe(true);
    expect(response.body.operations.length).toBeGreaterThan(0);
    
    // Check if the operations have the expected structure
    const firstOperation = response.body.operations[0];
    expect(firstOperation).toHaveProperty('name');
    expect(firstOperation).toHaveProperty('description');
    expect(firstOperation).toHaveProperty('params');
  });
  
  test('POST /api/images/grayscale should process an image', async () => {
    // Create a test image
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    if (!fs.existsSync(testImagePath)) {
      const sharp = require('sharp');
      await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 3,
          background: { r: 0, g: 0, b: 0 }
        }
      })
        .jpeg()
        .toFile(testImagePath);
    }
    
    const response = await request(app)
      .post('/api/images/grayscale')
      .attach('image', testImagePath)
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.operation).toBe('grayscale');
    expect(response.body.input).toBeDefined();
    expect(response.body.output).toBeDefined();
    expect(response.body.input.url).toBeDefined();
    expect(response.body.output.url).toBeDefined();
  });
  
  test('POST /api/images/resize should require width and height', async () => {
    // Create a test image
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    if (!fs.existsSync(testImagePath)) {
      const sharp = require('sharp');
      await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 3,
          background: { r: 0, g: 0, b: 0 }
        }
      })
        .jpeg()
        .toFile(testImagePath);
    }
    
    const response = await request(app)
      .post('/api/images/resize')
      .attach('image', testImagePath)
      .expect('Content-Type', /json/)
      .expect(400);
    
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('required');
  });
});
