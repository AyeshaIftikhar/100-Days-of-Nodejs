const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const { benchmark } = require('../src/services/benchmarkService');

const fs_readFile = promisify(fs.readFile);
const fs_writeFile = promisify(fs.writeFile);
const fs_unlink = promisify(fs.unlink);

// Test sample image path
const TEST_IMAGE_PATH = path.join(__dirname, 'test-image.jpg');

// Create a sample test image if it doesn't exist
async function ensureTestImage() {
  try {
    await fs_readFile(TEST_IMAGE_PATH);
  } catch (error) {
    // Create a simple 100x100 black JPEG
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
      .toFile(TEST_IMAGE_PATH);
  }
}

describe('Benchmark Service', () => {
  beforeAll(async () => {
    await ensureTestImage();
  });

  test('Should return benchmark results', async () => {
    // Use a small number of iterations for tests
    const iterations = 2;
    
    const results = await benchmark(TEST_IMAGE_PATH, iterations);
    
    expect(results).toBeDefined();
    expect(results.image).toBeDefined();
    expect(results.image.width).toBeDefined();
    expect(results.image.height).toBeDefined();
    expect(results.operations).toBeDefined();
    
    // Check if all operations are benchmarked
    expect(results.operations.grayscale).toBeDefined();
    expect(results.operations.blur).toBeDefined();
    expect(results.operations['edge-detection']).toBeDefined();
    
    // Check if JS times are recorded
    expect(results.operations.grayscale.js.times.length).toBe(iterations);
    expect(results.operations.grayscale.js.average).toBeGreaterThan(0);
    
    // WebAssembly might not be available in test environment
    // so we don't assert its presence
  }, 30000); // Increase timeout for benchmark
});
