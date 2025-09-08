const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const sharp = require('sharp');
const { logger } = require('./loggerService');
const { loadModule } = require('../utils/moduleLoader');

const fs_readFile = promisify(fs.readFile);

// Load WebAssembly module
async function loadWasmModule() {
  try {
    const wasmPath = path.join(__dirname, '../../public/wasm/image_processing.js');
    
    // Check if the WASM module exists
    if (!fs.existsSync(wasmPath)) {
      throw new Error('WebAssembly module not found');
    }
    
    // Load the module using our utility
    const ImageProcessingModule = await loadModule(wasmPath);
    return await ImageProcessingModule;
  } catch (error) {
    logger.error('Failed to load WebAssembly module:', error);
    throw error;
  }
}

// Benchmark WebAssembly vs JavaScript implementations
async function benchmark(imagePath, iterations = 5) {
  try {
    // Read the image
    const imageBuffer = await fs_readFile(imagePath);
    
    // Convert to raw pixel data
    const { data, info } = await sharp(imageBuffer)
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    const { width, height, channels } = info;
    
    // Load WebAssembly module
    let wasm;
    try {
      wasm = await loadWasmModule();
    } catch (error) {
      logger.warn('WebAssembly module not available for benchmarking');
    }
    
    const results = {
      image: {
        path: imagePath,
        width,
        height,
        channels,
        size: imageBuffer.length
      },
      operations: {}
    };
    
    // Benchmark operations
    const operations = ['grayscale', 'blur', 'edge-detection'];
    
    for (const operation of operations) {
      results.operations[operation] = {
        wasm: { times: [], average: 0 },
        js: { times: [], average: 0 }
      };
      
      // WebAssembly implementation
      if (wasm) {
        for (let i = 0; i < iterations; i++) {
          const start = performance.now();
          
          // Allocate memory
          const dataPtr = wasm._malloc(data.length);
          wasm.HEAPU8.set(data, dataPtr);
          
          // Process image
          switch (operation) {
            case 'grayscale':
              wasm._grayscale(dataPtr, width, height, channels);
              break;
            case 'blur':
              wasm._blur(dataPtr, width, height, channels, 3);
              break;
            case 'edge-detection':
              wasm._edgeDetection(dataPtr, width, height, channels, 50);
              break;
          }
          
          // Free memory
          wasm._free(dataPtr);
          
          const end = performance.now();
          results.operations[operation].wasm.times.push(end - start);
        }
        
        // Calculate average
        const sum = results.operations[operation].wasm.times.reduce((a, b) => a + b, 0);
        results.operations[operation].wasm.average = sum / iterations;
      }
      
      // JavaScript implementation
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        
        const image = sharp(imageBuffer);
        
        switch (operation) {
          case 'grayscale':
            await image.grayscale().toBuffer();
            break;
          case 'blur':
            await image.blur(3).toBuffer();
            break;
          case 'edge-detection':
            await image.convolve({
              width: 3,
              height: 3,
              kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1]
            }).toBuffer();
            break;
        }
        
        const end = performance.now();
        results.operations[operation].js.times.push(end - start);
      }
      
      // Calculate average
      const sum = results.operations[operation].js.times.reduce((a, b) => a + b, 0);
      results.operations[operation].js.average = sum / iterations;
      
      // Calculate improvement percentage if WebAssembly is available
      if (wasm) {
        const jsAvg = results.operations[operation].js.average;
        const wasmAvg = results.operations[operation].wasm.average;
        
        if (jsAvg > 0) {
          const improvement = ((jsAvg - wasmAvg) / jsAvg) * 100;
          results.operations[operation].improvement = improvement.toFixed(2) + '%';
        }
      }
    }
    
    return results;
  } catch (error) {
    logger.error('Error in benchmark:', error);
    throw error;
  }
}

module.exports = {
  benchmark
};
