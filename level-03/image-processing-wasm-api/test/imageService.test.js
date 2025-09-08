const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const imageService = require('../src/services/imageService');

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true)
}));

// Mock the sharp module
jest.mock('sharp', () => {
  return jest.fn().mockImplementation(() => ({
    raw: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue({
      data: Buffer.from([255, 0, 0, 255, 0, 255, 0, 255]), // Fake RGBA pixel data
      info: { width: 2, height: 1, channels: 4 }
    }),
    grayscale: jest.fn().mockReturnThis(),
    blur: jest.fn().mockReturnThis(),
    convolve: jest.fn().mockReturnThis(),
    modulate: jest.fn().mockReturnThis(),
    resize: jest.fn().mockReturnThis(),
    toFile: jest.fn().mockResolvedValue({})
  }));
});

describe('Image Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock readFile to return a fake image buffer
    readFile.mockResolvedValue(Buffer.from('fake-image-data'));
  });
  
  it('should process an image with grayscale operation', async () => {
    const result = await imageService.processImage(
      'input.jpg',
      'output.jpg',
      'grayscale'
    );
    
    expect(result.success).toBe(true);
    expect(result.operation).toBe('grayscale');
    expect(result.inputPath).toBe('input.jpg');
    expect(result.outputPath).toBe('output.jpg');
  });
  
  it('should process an image with blur operation', async () => {
    const result = await imageService.processImage(
      'input.jpg',
      'output.jpg',
      'blur',
      { radius: 5 }
    );
    
    expect(result.success).toBe(true);
    expect(result.operation).toBe('blur');
    expect(result.params.radius).toBe(5);
  });
  
  it('should process an image with edge-detection operation', async () => {
    const result = await imageService.processImage(
      'input.jpg',
      'output.jpg',
      'edge-detection',
      { threshold: 100 }
    );
    
    expect(result.success).toBe(true);
    expect(result.operation).toBe('edge-detection');
    expect(result.params.threshold).toBe(100);
  });
  
  it('should process an image with brightness operation', async () => {
    const result = await imageService.processImage(
      'input.jpg',
      'output.jpg',
      'brightness',
      { adjustment: 20 }
    );
    
    expect(result.success).toBe(true);
    expect(result.operation).toBe('brightness');
    expect(result.params.adjustment).toBe(20);
  });
  
  it('should process an image with resize operation', async () => {
    const result = await imageService.processImage(
      'input.jpg',
      'output.jpg',
      'resize',
      { width: 800, height: 600 }
    );
    
    expect(result.success).toBe(true);
    expect(result.operation).toBe('resize');
    expect(result.params.width).toBe(800);
    expect(result.params.height).toBe(600);
  });
  
  it('should throw an error for unsupported operations', async () => {
    await expect(
      imageService.processImage('input.jpg', 'output.jpg', 'unsupported-operation')
    ).rejects.toThrow('Unsupported operation');
  });
  
  it('should throw an error if input file cannot be read', async () => {
    readFile.mockRejectedValue(new Error('File not found'));
    
    await expect(
      imageService.processImage('nonexistent.jpg', 'output.jpg', 'grayscale')
    ).rejects.toThrow();
  });
});
