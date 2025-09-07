'use strict';

const axios = require('axios');
const logger = require('../../src/logger');
const defaultConfig = require('../../config/default');

/**
 * API testing client using axios
 */
class ApiTest {
  /**
   * Create a new API test client
   * @param {Object} config - API configuration
   */
  constructor(config = {}) {
    this.config = {
      ...defaultConfig.api,
      ...config
    };
    
    // Create axios instance with default configuration
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: this.config.headers,
      auth: this.config.auth
    });
    
    // Add request interceptor for logging
    this.client.interceptors.request.use((request) => {
      logger.debug(`API Request: ${request.method.toUpperCase()} ${request.baseURL}${request.url}`);
      return request;
    });
    
    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`API Response: ${response.status} ${response.statusText}`);
        return response;
      },
      (error) => {
        if (error.response) {
          logger.debug(`API Error Response: ${error.response.status} ${error.response.statusText}`);
        } else {
          logger.debug(`API Request Error: ${error.message}`);
        }
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Send a GET request
   * @param {string} url - The URL to request
   * @param {Object} config - Additional axios config
   * @returns {Promise<Object>} Axios response
   */
  async get(url, config = {}) {
    return this.client.get(url, config);
  }
  
  /**
   * Send a POST request
   * @param {string} url - The URL to request
   * @param {Object} data - Request payload
   * @param {Object} config - Additional axios config
   * @returns {Promise<Object>} Axios response
   */
  async post(url, data = {}, config = {}) {
    return this.client.post(url, data, config);
  }
  
  /**
   * Send a PUT request
   * @param {string} url - The URL to request
   * @param {Object} data - Request payload
   * @param {Object} config - Additional axios config
   * @returns {Promise<Object>} Axios response
   */
  async put(url, data = {}, config = {}) {
    return this.client.put(url, data, config);
  }
  
  /**
   * Send a DELETE request
   * @param {string} url - The URL to request
   * @param {Object} config - Additional axios config
   * @returns {Promise<Object>} Axios response
   */
  async delete(url, config = {}) {
    return this.client.delete(url, config);
  }
  
  /**
   * Send a PATCH request
   * @param {string} url - The URL to request
   * @param {Object} data - Request payload
   * @param {Object} config - Additional axios config
   * @returns {Promise<Object>} Axios response
   */
  async patch(url, data = {}, config = {}) {
    return this.client.patch(url, data, config);
  }
  
  /**
   * Get a resource by ID
   * @param {string} resource - Resource name
   * @param {string|number} id - Resource ID
   * @returns {Promise<Object>} Axios response
   */
  async getById(resource, id) {
    return this.get(`/${resource}/${id}`);
  }
  
  /**
   * Create a new resource
   * @param {string} resource - Resource name
   * @param {Object} data - Resource data
   * @returns {Promise<Object>} Axios response
   */
  async create(resource, data) {
    return this.post(`/${resource}`, data);
  }
  
  /**
   * Update a resource
   * @param {string} resource - Resource name
   * @param {string|number} id - Resource ID
   * @param {Object} data - Updated resource data
   * @returns {Promise<Object>} Axios response
   */
  async update(resource, id, data) {
    return this.put(`/${resource}/${id}`, data);
  }
  
  /**
   * Delete a resource
   * @param {string} resource - Resource name
   * @param {string|number} id - Resource ID
   * @returns {Promise<Object>} Axios response
   */
  async delete(resource, id) {
    return this.delete(`/${resource}/${id}`);
  }
  
  /**
   * Set authentication token
   * @param {string} token - Authentication token
   */
  setToken(token) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  /**
   * Clear authentication token
   */
  clearToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }
}

// Create default API test instance
const apiTest = new ApiTest();

module.exports = {
  ApiTest,
  apiTest
};
