/**
 * This utility file provides helpers for working with ES Modules and CommonJS
 * to ensure compatibility across different module systems.
 */

const path = require('path');
const fs = require('fs');

/**
 * Load a JavaScript module in a way that works in both CommonJS and ESM contexts
 * 
 * @param {string} modulePath - Absolute path to the module
 * @returns {Promise<any>} - The loaded module
 */
async function loadModule(modulePath) {
  try {
    // Check if the module exists
    if (!fs.existsSync(modulePath)) {
      throw new Error(`Module not found: ${modulePath}`);
    }
    
    // In CommonJS context, we can just use require directly
    const module = require(modulePath);
    
    // If the module is a function that needs to be initialized (like WASM modules)
    if (typeof module === 'function') {
      return await module();
    }
    
    return module;
  } catch (error) {
    console.error(`Error loading module ${modulePath}:`, error);
    throw error;
  }
}

module.exports = {
  loadModule
};
