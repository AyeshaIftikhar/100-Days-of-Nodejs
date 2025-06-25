const fs = require('fs').promises;
const path = require('path');
const config = require('../utils/config');
const { generateShortCode } = require('../utils/helpers');

class UrlModel {
  constructor() {
    this.dbPath = path.resolve(__dirname, '..', config.DB_FILE);
    this.initializeDB();
  }

  async initializeDB() {
    try {
      await fs.access(this.dbPath);
    } catch (error) {
      // Create file if it doesn't exist
      await fs.writeFile(this.dbPath, JSON.stringify({ urls: [] }));
    }
  }

  async readData() {
    const data = await fs.readFile(this.dbPath, 'utf8');
    return JSON.parse(data);
  }

  async writeData(data) {
    await fs.writeFile(this.dbPath, JSON.stringify(data, null, 2));
  }

  async createUrl(originalUrl) {
    const data = await this.readData();
    const existingUrl = data.urls.find(url => url.originalUrl === originalUrl);
    
    if (existingUrl) {
      return existingUrl;
    }

    const newUrl = {
      shortCode: generateShortCode(),
      originalUrl,
      createdAt: new Date().toISOString(),
      clicks: 0
    };

    data.urls.push(newUrl);
    await this.writeData(data);
    return newUrl;
  }

  async getUrl(shortCode) {
    const data = await this.readData();
    const url = data.urls.find(url => url.shortCode === shortCode);
    
    if (url) {
      url.clicks += 1;
      await this.writeData(data);
    }
    
    return url;
  }

  async getAllUrls() {
    const data = await this.readData();
    return data.urls;
  }
}

module.exports = new UrlModel();