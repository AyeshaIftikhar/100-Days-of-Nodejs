const fs = require('fs').promises;
const path = require('path');
const config = require('../config/cryptoConfig');
const ApiError = require('../utils/apiError');
const logger = require('../utils/logger');

class StorageService {
  static async initStorage() {
    try {
      await fs.mkdir(config.storagePath, { recursive: true });
      logger.info('Storage directory initialized');
    } catch (error) {
      logger.error(`Storage initialization failed: ${error.message}`);
      throw new Error('Could not initialize storage directory');
    }
  }

  static async saveEncryptedFile(originalName, encryptedData) {
    await this.initStorage();
    
    const timestamp = Date.now();
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    const encryptedFileName = `${baseName}_${timestamp}.enc`;
    const filePath = path.join(config.storagePath, encryptedFileName);
    
    try {
      await fs.writeFile(filePath, encryptedData);
      logger.info(`File saved: ${encryptedFileName}`);
      return filePath;
    } catch (error) {
      logger.error(`File save failed: ${error.message}`);
      throw new Error('Could not save encrypted file');
    }
  }

  static async getEncryptedFile(filename) {
    const filePath = path.join(config.storagePath, filename);
    
    try {
      const data = await fs.readFile(filePath);
      logger.debug(`File retrieved: ${filename}`);
      return data;
    } catch (error) {
      logger.error(`File retrieval failed: ${error.message}`);
      throw new ApiError('File not found', 404);
    }
  }

  static async getEncryptedFilePath(filename) {
    const filePath = path.join(config.storagePath, filename);
    
    try {
      await fs.access(filePath);
      return filePath;
    } catch (error) {
      logger.error(`File path access failed: ${error.message}`);
      throw new ApiError('File not found', 404);
    }
  }

  static async listEncryptedFiles() {
    await this.initStorage();
    
    try {
      const files = await fs.readdir(config.storagePath);
      const encryptedFiles = files.filter(file => file.endsWith('.enc'));
      
      return encryptedFiles.map(file => ({
        name: file,
        size: fs.statSync(path.join(config.storagePath, file)).size,
        createdAt: fs.statSync(path.join(config.storagePath, file)).birthtime
      }));
    } catch (error) {
      logger.error(`File listing failed: ${error.message}`);
      throw new Error('Could not list files');
    }
  }
}

module.exports = new StorageService();