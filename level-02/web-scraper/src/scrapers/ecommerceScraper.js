const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../utils/logger');
const scrapeConfig = require('../config/scrapeConfig');

class EcommerceScraper {
  constructor() {
    this.client = axios.create({
      timeout: scrapeConfig.requestTimeout,
      headers: {
        ...scrapeConfig.defaultHeaders,
        'User-Agent': scrapeConfig.userAgent,
      },
    });
  }

  async scrapeProductPage(url) {
    try {
      logger.info(`Scraping ecommerce product page: ${url}`);
      
      const response = await this.client.get(url);
      const $ = cheerio.load(response.data);

      const productData = {
        url,
        title: this._cleanText($('h1.product-title').text()),
        price: this._extractPrice($('.price').text()),
        description: this._cleanText($('.product-description').text()),
        images: this._extractImages($),
        availability: this._checkAvailability($),
        specifications: this._extractSpecifications($),
        lastUpdated: new Date(),
      };

      return productData;
    } catch (error) {
      logger.error(`Failed to scrape product page ${url}: ${error.message}`);
      throw error;
    }
  }

  _cleanText(text) {
    return text.replace(/\s+/g, ' ').trim();
  }

  _extractPrice(priceText) {
    const priceMatch = priceText.match(/\d+\.\d{2}/);
    return priceMatch ? parseFloat(priceMatch[0]) : null;
  }

  _extractImages($) {
    const images = [];
    $('.product-gallery img').each((i, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src) images.push(src);
    });
    return images;
  }

  _checkAvailability($) {
    return $('.stock-available').length > 0;
  }

  _extractSpecifications($) {
    const specs = {};
    $('.specs-table tr').each((i, el) => {
      const key = this._cleanText($(el).find('th').text());
      const value = this._cleanText($(el).find('td').text());
      if (key && value) specs[key] = value;
    });
    return specs;
  }
}

module.exports = new EcommerceScraper();