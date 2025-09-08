const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { promisify } = require('util');
const { loadModule } = require('../utils/moduleLoader');
const fs_readFile = promisify(fs.readFile);

// Check if WebAssembly module is available
let wasmModule = null;

// Lazy loading of the WebAssembly module
async function loadWasmModule() {
  if (wasmModule) return wasmModule;
  
  try {
    // In Node.js environment, we need to load the WASM module differently than in a browser
    const wasmPath = path.join(__dirname, '../../public/wasm/image_processing.js');
    
    // Check if the WASM module exists
    if (!fs.existsSync(wasmPath)) {
      console.error('WebAssembly module not found. Make sure to build it first.');
      throw new Error('WebAssembly module not found');
    }
    
    // Load the module using our utility
    const ImageProcessingModule = await loadModule(wasmPath);
    wasmModule = await ImageProcessingModule;
    
    return wasmModule;
  } catch (error) {
    console.error('Failed to load WebAssembly module:', error);
    throw error;
  }
}

// Process image with WebAssembly
async function processImageWithWasm(inputBuffer, operation, params = {}) {
  try {
    // Convert input to a raw pixel buffer with sharp
    const { data, info } = await sharp(inputBuffer)
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    const { width, height, channels } = info;
    
    // Load the WebAssembly module
    const wasm = await loadWasmModule();
    
    // Allocate memory in the WebAssembly module for our image data
    const dataPtr = wasm._malloc(data.length);
    
    // Copy our image data to the WebAssembly memory
    wasm.HEAPU8.set(data, dataPtr);
    
    // Process the image based on the requested operation
    switch (operation) {
      case 'grayscale':
        wasm._grayscale(dataPtr, width, height, channels);
        break;
        
      case 'blur':
        const radius = params.radius || 3;
        wasm._blur(dataPtr, width, height, channels, radius);
        break;
        
      case 'edge-detection':
        const threshold = params.threshold || 50;
        wasm._edgeDetection(dataPtr, width, height, channels, threshold);
        break;
        
      case 'brightness':
        const adjustment = params.adjustment || 0;
        wasm._adjustBrightness(dataPtr, width, height, channels, adjustment);
        break;
        
      case 'resize':
        if (!params.width || !params.height) {
          throw new Error('Width and height are required for resize operation');
        }
        
        const newWidth = params.width;
        const newHeight = params.height;
        
        // Allocate memory for the resized image
        const newDataPtr = wasm._malloc(newWidth * newHeight * channels);
        
        // Resize the image
        wasm._resizeImage(dataPtr, width, height, newDataPtr, newWidth, newHeight, channels);
        
        // Get the processed data
        const newProcessedData = new Uint8Array(wasm.HEAPU8.buffer, newDataPtr, newWidth * newHeight * channels);
        const newDataCopy = Buffer.from(newProcessedData);
        
        // Free the allocated memory
        wasm._free(dataPtr);
        wasm._free(newDataPtr);
        
        // Convert back to the desired format
        return sharp(newDataCopy, {
          raw: {
            width: newWidth,
            height: newHeight,
            channels: channels
          }
        });
        
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
    
    // Get the processed data
    const processedData = new Uint8Array(wasm.HEAPU8.buffer, dataPtr, data.length);
    const dataCopy = Buffer.from(processedData);
    
    // Free the allocated memory
    wasm._free(dataPtr);
    
    // Convert back to the desired format
    return sharp(dataCopy, {
      raw: {
        width: width,
        height: height,
        channels: channels
      }
    });
  } catch (error) {
    console.error('Error processing image with WebAssembly:', error);
    throw error;
  }
}

// Fallback to JavaScript image processing when WebAssembly is not available
async function processImageWithJS(inputBuffer, operation, params = {}) {
  const image = sharp(inputBuffer);
  
  switch (operation) {
    case 'grayscale':
      return image.grayscale();
      
    case 'blur':
      const radius = params.radius || 3;
      return image.blur(radius);
      
    case 'edge-detection':
      // Using sharp's convolve operation to approximate edge detection
      return image.convolve({
        width: 3,
        height: 3,
        kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1]
      });
      
    case 'brightness':
      const adjustment = params.adjustment || 0;
      return image.modulate({
        brightness: 1 + adjustment / 100
      });
      
    case 'resize':
      if (!params.width || !params.height) {
        throw new Error('Width and height are required for resize operation');
      }
      return image.resize(params.width, params.height);
      
    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
}

// Main function to process an image
async function processImage(inputPath, outputPath, operation, params = {}) {
  try {
    const inputBuffer = await fs_readFile(inputPath);
    
    let processedImage;
    
    try {
      // Try to use WebAssembly first
      processedImage = await processImageWithWasm(inputBuffer, operation, params);
    } catch (error) {
      console.warn('WebAssembly processing failed, falling back to JavaScript:', error.message);
      // Fall back to JavaScript implementation
      processedImage = await processImageWithJS(inputBuffer, operation, params);
    }
    
    // Save the processed image
    await processedImage.toFile(outputPath);
    
    return {
      success: true,
      inputPath,
      outputPath,
      operation,
      params
    };
  } catch (error) {
    console.error('Error in image processing service:', error);
    throw error;
  }
}

module.exports = {
  processImage,
};
