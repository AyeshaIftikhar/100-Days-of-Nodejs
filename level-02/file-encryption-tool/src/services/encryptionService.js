const crypto = require('crypto');
const config = require('../config/cryptoConfig');
const logger = require('../utils/logger');
const ProgressTracker = require('../utils/progressTracker');

class EncryptionService {
  static async encryptFile(buffer, password) {
    try {
      const progress = new ProgressTracker('Encryption');
      
      // Generate salt
      const salt = crypto.randomBytes(config.saltLength);
      progress.update(10);
      
      // Derive key
      const key = crypto.pbkdf2Sync(
        password,
        salt,
        config.keyIterations,
        config.keyLength,
        config.digest
      );
      progress.update(30);
      
      // Generate IV
      const iv = crypto.randomBytes(config.ivLength);
      progress.update(40);
      
      // Create cipher
      const cipher = crypto.createCipheriv(config.algorithm, key, iv);
      progress.update(50);
      
      // Encrypt file
      const encrypted = Buffer.concat([
        salt,
        iv,
        cipher.update(buffer),
        cipher.final()
      ]);
      progress.update(100);
      
      logger.debug('File encryption completed');
      return encrypted;
    } catch (error) {
      logger.error(`Encryption failed: ${error.message}`);
      throw new Error('Encryption process failed');
    }
  }

  static async decryptFile(encryptedFile, password) {
    try {
      const progress = new ProgressTracker('Decryption');
      
      // Extract salt (first saltLength bytes)
      const salt = encryptedFile.slice(0, config.saltLength);
      progress.update(10);
      
      // Extract IV (next ivLength bytes)
      const iv = encryptedFile.slice(
        config.saltLength,
        config.saltLength + config.ivLength
      );
      progress.update(20);
      
      // Extract encrypted data (rest)
      const encryptedData = encryptedFile.slice(config.saltLength + config.ivLength);
      progress.update(30);
      
      // Derive key
      const key = crypto.pbkdf2Sync(
        password,
        salt,
        config.keyIterations,
        config.keyLength,
        config.digest
      );
      progress.update(60);
      
      // Create decipher
      const decipher = crypto.createDecipheriv(config.algorithm, key, iv);
      progress.update(70);
      
      // Decrypt file
      const decrypted = Buffer.concat([
        decipher.update(encryptedData),
        decipher.final()
      ]);
      progress.update(100);
      
      logger.debug('File decryption completed');
      return decrypted;
    } catch (error) {
      logger.error(`Decryption failed: ${error.message}`);
      throw new Error('Decryption process failed - possibly wrong password');
    }
  }
}

module.exports = EncryptionService;