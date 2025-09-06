// Node.js SDK Client for Feature Flag Service
// This is a simple example of how a client SDK could be implemented

const axios = require('axios');

class FeatureFlagClient {
  /**
   * Initialize the Feature Flag Client
   * @param {Object} config Configuration object
   * @param {string} config.apiUrl Base URL for the Feature Flag Service API
   * @param {string} config.projectId Project ID
   * @param {string} config.environment Environment name (development, staging, production)
   * @param {string} config.userId User ID to evaluate flags for
   * @param {Object} config.context Additional context attributes for targeting
   */
  constructor(config) {
    this.config = {
      apiUrl: 'http://localhost:3000/api',
      environment: 'development',
      context: {},
      ...config
    };
    
    if (!this.config.projectId) {
      throw new Error('projectId is required');
    }
    
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.cacheTTL = 60 * 1000; // 1 minute cache
  }
  
  /**
   * Evaluate a feature flag
   * @param {string} flagKey The feature flag key
   * @param {string} userId User ID to evaluate for (overrides the one in config)
   * @param {Object} context Additional context (merged with the one in config)
   * @returns {Promise<Object>} Evaluation result
   */
  async evaluate(flagKey, userId = null, context = {}) {
    const user = userId || this.config.userId;
    
    if (!user) {
      throw new Error('userId is required either in the config or as a parameter');
    }
    
    // Check cache first
    const cacheKey = `${flagKey}:${user}:${this.config.environment}`;
    if (this.cache.has(cacheKey) && this.cacheExpiry.get(cacheKey) > Date.now()) {
      return this.cache.get(cacheKey);
    }
    
    try {
      // Merge context from config and parameter
      const mergedContext = { ...this.config.context, ...context };
      
      const response = await axios.post(
        `${this.config.apiUrl}/projects/${this.config.projectId}/evaluate`,
        {
          flagKey,
          environment: this.config.environment,
          userId: user,
          context: mergedContext
        }
      );
      
      const result = response.data.data;
      
      // Cache the result
      this.cache.set(cacheKey, result);
      this.cacheExpiry.set(cacheKey, Date.now() + this.cacheTTL);
      
      return result;
    } catch (error) {
      // Handle network or server errors
      console.error('Error evaluating feature flag:', error.message);
      
      // Return a safe default (flag disabled)
      return {
        enabled: false,
        variant: null,
        value: null,
        reason: 'Error evaluating flag'
      };
    }
  }
  
  /**
   * Check if a feature flag is enabled
   * @param {string} flagKey The feature flag key
   * @param {string} userId User ID to evaluate for (overrides the one in config)
   * @param {Object} context Additional context (merged with the one in config)
   * @returns {Promise<boolean>} Whether the flag is enabled
   */
  async isEnabled(flagKey, userId = null, context = {}) {
    const result = await this.evaluate(flagKey, userId, context);
    return result.enabled;
  }
  
  /**
   * Get the value of a feature flag
   * @param {string} flagKey The feature flag key
   * @param {*} defaultValue Default value to return if flag is disabled or error occurs
   * @param {string} userId User ID to evaluate for (overrides the one in config)
   * @param {Object} context Additional context (merged with the one in config)
   * @returns {Promise<*>} The flag value or defaultValue if disabled
   */
  async getValue(flagKey, defaultValue = null, userId = null, context = {}) {
    const result = await this.evaluate(flagKey, userId, context);
    return result.enabled ? result.value : defaultValue;
  }
  
  /**
   * Evaluate multiple feature flags in a batch
   * @param {Array<string>} flagKeys Array of feature flag keys
   * @param {string} userId User ID to evaluate for (overrides the one in config)
   * @param {Object} context Additional context (merged with the one in config)
   * @returns {Promise<Object>} Object with flag keys as properties and evaluation results as values
   */
  async evaluateBatch(flagKeys, userId = null, context = {}) {
    const user = userId || this.config.userId;
    
    if (!user) {
      throw new Error('userId is required either in the config or as a parameter');
    }
    
    try {
      // Merge context from config and parameter
      const mergedContext = { ...this.config.context, ...context };
      
      const response = await axios.post(
        `${this.config.apiUrl}/projects/${this.config.projectId}/evaluate-batch`,
        {
          flagKeys,
          environment: this.config.environment,
          userId: user,
          context: mergedContext
        }
      );
      
      return response.data.data;
    } catch (error) {
      // Handle network or server errors
      console.error('Error batch evaluating feature flags:', error.message);
      
      // Return safe defaults (all flags disabled)
      const result = {};
      for (const key of flagKeys) {
        result[key] = {
          enabled: false,
          variant: null,
          value: null,
          reason: 'Error evaluating flag'
        };
      }
      
      return result;
    }
  }
  
  /**
   * Clear the client cache
   */
  clearCache() {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}

module.exports = { FeatureFlagClient };
