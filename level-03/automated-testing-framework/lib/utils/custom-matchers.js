'use strict';

/**
 * Custom Jest matchers
 */
const customMatchers = {
  /**
   * Check if a value is a valid email
   * @param {string} received - Value to check
   * @returns {Object} Result object
   */
  toBeValidEmail: (received) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    return {
      pass,
      message: () => `Expected ${received} ${pass ? 'not ' : ''}to be a valid email`,
    };
  },
  
  /**
   * Check if a response has a specific status code
   * @param {Object} received - Response object
   * @param {number} statusCode - Expected status code
   * @returns {Object} Result object
   */
  toHaveStatusCode: (received, statusCode) => {
    const pass = received.status === statusCode;
    
    return {
      pass,
      message: () => `Expected response to ${pass ? 'not ' : ''}have status code ${statusCode}, but it has ${received.status}`,
    };
  },
  
  /**
   * Check if a response has a JSON content type
   * @param {Object} received - Response object
   * @returns {Object} Result object
   */
  toBeJsonResponse: (received) => {
    const contentType = received.headers['content-type'] || '';
    const pass = contentType.includes('application/json');
    
    return {
      pass,
      message: () => `Expected response to ${pass ? 'not ' : ''}be JSON, but content-type is "${contentType}"`,
    };
  },
  
  /**
   * Check if a response time is less than a threshold
   * @param {Object} received - Response object with responseTime property
   * @param {number} threshold - Maximum allowed response time in milliseconds
   * @returns {Object} Result object
   */
  toHaveResponseTimeLessThan: (received, threshold) => {
    const responseTime = received.responseTime || 0;
    const pass = responseTime < threshold;
    
    return {
      pass,
      message: () => `Expected response time to be ${pass ? 'not ' : ''}less than ${threshold}ms, but it was ${responseTime}ms`,
    };
  },
  
  /**
   * Check if a value is between a min and max (inclusive)
   * @param {number} received - Value to check
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {Object} Result object
   */
  toBeBetween: (received, min, max) => {
    const pass = received >= min && received <= max;
    
    return {
      pass,
      message: () => `Expected ${received} to ${pass ? 'not ' : ''}be between ${min} and ${max}`,
    };
  },
  
  /**
   * Check if an array has unique items
   * @param {Array} received - Array to check
   * @returns {Object} Result object
   */
  toHaveUniqueItems: (received) => {
    const uniqueItems = new Set(received);
    const pass = uniqueItems.size === received.length;
    
    return {
      pass,
      message: () => `Expected array to ${pass ? 'not ' : ''}have unique items`,
    };
  },
  
  /**
   * Check if a string matches a semantic version format
   * @param {string} received - Value to check
   * @returns {Object} Result object
   */
  toBeSemanticVersion: (received) => {
    const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
    const pass = semverRegex.test(received);
    
    return {
      pass,
      message: () => `Expected ${received} ${pass ? 'not ' : ''}to be a semantic version`,
    };
  }
};

module.exports = customMatchers;
