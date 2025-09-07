'use strict';

const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');
const logger = require('../../src/logger');
const defaultConfig = require('../../config/default');

/**
 * UI testing client using Puppeteer
 */
class UiTest {
  /**
   * Create a new UI test client
   * @param {Object} config - Browser configuration
   */
  constructor(config = {}) {
    this.config = {
      ...defaultConfig.browser,
      ...config
    };
    
    this.browser = null;
    this.page = null;
    this.screenshots = {
      ...defaultConfig.screenshots,
      ...(config.screenshots || {})
    };
    
    // Ensure screenshots directory exists if enabled
    if (this.screenshots.enabled) {
      fs.ensureDirSync(this.screenshots.path);
    }
  }
  
  /**
   * Launch browser and create a new page
   * @returns {Promise<void>}
   */
  async launch() {
    if (this.browser) {
      return;
    }
    
    logger.debug('Launching browser');
    
    const isHeadless = process.env.TEST_HEADLESS === 'true' || this.config.headless;
    
    this.browser = await puppeteer.launch({
      headless: isHeadless,
      slowMo: this.config.slowMo,
      args: this.config.args,
      ignoreHTTPSErrors: this.config.ignoreHTTPSErrors
    });
    
    this.page = await this.browser.newPage();
    
    // Set viewport size
    await this.page.setViewport({
      width: this.config.width,
      height: this.config.height
    });
    
    // Set default timeout
    this.page.setDefaultTimeout(this.config.defaultTimeout);
    
    // Set up console logging
    this.page.on('console', (message) => {
      const type = message.type().toLowerCase();
      const text = message.text();
      
      if (type === 'error') {
        logger.error(`Browser console error: ${text}`);
      } else {
        logger.debug(`Browser console [${type}]: ${text}`);
      }
    });
    
    // Handle page errors
    this.page.on('pageerror', (error) => {
      logger.error(`Browser page error: ${error.message}`);
    });
    
    // Handle request failures
    this.page.on('requestfailed', (request) => {
      logger.debug(`Browser request failed: ${request.url()}`);
    });
    
    logger.debug('Browser launched successfully');
  }
  
  /**
   * Close browser
   * @returns {Promise<void>}
   */
  async close() {
    if (this.browser) {
      logger.debug('Closing browser');
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
  
  /**
   * Navigate to a URL
   * @param {string} url - URL to navigate to
   * @returns {Promise<void>}
   */
  async navigate(url) {
    if (!this.browser) {
      await this.launch();
    }
    
    logger.debug(`Navigating to ${url}`);
    await this.page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: this.config.defaultTimeout
    });
  }
  
  /**
   * Take a screenshot
   * @param {string} name - Screenshot name
   * @returns {Promise<string>} Screenshot path
   */
  async screenshot(name) {
    if (!this.screenshots.enabled) {
      return null;
    }
    
    const fileName = `${name}_${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
    const filePath = path.join(this.screenshots.path, fileName);
    
    logger.debug(`Taking screenshot: ${filePath}`);
    
    await this.page.screenshot({
      path: filePath,
      fullPage: this.screenshots.fullPage
    });
    
    return filePath;
  }
  
  /**
   * Wait for element to be visible
   * @param {string} selector - CSS selector
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<ElementHandle>} Puppeteer element handle
   */
  async waitForElement(selector, timeout = this.config.defaultTimeout) {
    logger.debug(`Waiting for element: ${selector}`);
    return this.page.waitForSelector(selector, { 
      visible: true,
      timeout
    });
  }
  
  /**
   * Click an element
   * @param {string} selector - CSS selector
   * @returns {Promise<void>}
   */
  async click(selector) {
    logger.debug(`Clicking element: ${selector}`);
    await this.waitForElement(selector);
    await this.page.click(selector);
  }
  
  /**
   * Type text into an input field
   * @param {string} selector - CSS selector
   * @param {string} text - Text to type
   * @returns {Promise<void>}
   */
  async type(selector, text) {
    logger.debug(`Typing into element: ${selector}`);
    await this.waitForElement(selector);
    await this.page.type(selector, text);
  }
  
  /**
   * Get text content of an element
   * @param {string} selector - CSS selector
   * @returns {Promise<string>} Element text content
   */
  async getText(selector) {
    logger.debug(`Getting text from element: ${selector}`);
    await this.waitForElement(selector);
    return this.page.$eval(selector, el => el.textContent.trim());
  }
  
  /**
   * Get value of an input field
   * @param {string} selector - CSS selector
   * @returns {Promise<string>} Input value
   */
  async getValue(selector) {
    logger.debug(`Getting value from element: ${selector}`);
    await this.waitForElement(selector);
    return this.page.$eval(selector, el => el.value);
  }
  
  /**
   * Check if an element exists
   * @param {string} selector - CSS selector
   * @returns {Promise<boolean>} Whether element exists
   */
  async exists(selector) {
    logger.debug(`Checking if element exists: ${selector}`);
    return !!(await this.page.$(selector));
  }
  
  /**
   * Wait for navigation to complete
   * @param {Object} options - Navigation options
   * @returns {Promise<Response>} Navigation response
   */
  async waitForNavigation(options = {}) {
    logger.debug('Waiting for navigation');
    return this.page.waitForNavigation({
      waitUntil: 'networkidle2',
      timeout: this.config.defaultTimeout,
      ...options
    });
  }
  
  /**
   * Submit a form
   * @param {string} selector - CSS selector
   * @returns {Promise<void>}
   */
  async submitForm(selector) {
    logger.debug(`Submitting form: ${selector}`);
    await this.waitForElement(selector);
    await this.page.$eval(selector, form => form.submit());
    await this.waitForNavigation();
  }
  
  /**
   * Select an option from a dropdown
   * @param {string} selector - CSS selector
   * @param {string} value - Option value
   * @returns {Promise<void>}
   */
  async select(selector, value) {
    logger.debug(`Selecting option ${value} from dropdown: ${selector}`);
    await this.waitForElement(selector);
    await this.page.select(selector, value);
  }
  
  /**
   * Execute JavaScript in the browser context
   * @param {Function|string} fn - Function or string to execute
   * @param {...any} args - Arguments to pass to the function
   * @returns {Promise<any>} Result of the executed function
   */
  async evaluate(fn, ...args) {
    logger.debug('Evaluating JavaScript in browser context');
    return this.page.evaluate(fn, ...args);
  }
}

// Create default UI test instance
const uiTest = new UiTest();

module.exports = {
  UiTest,
  uiTest
};
