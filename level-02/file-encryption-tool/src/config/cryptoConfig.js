const dotenv = require('dotenv');
const crypto = require('crypto');

dotenv.config();

module.exports = {
  algorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-cbc',
  ivLength: parseInt(process.env.DEFAULT_IV_LENGTH) || 16,
  saltLength: 64,
  keyIterations: 100000,
  keyLength: 32,
  digest: 'sha512',
  storagePath: process.env.STORAGE_PATH || './file-storage',
  maxFileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 50) * 1024 * 1024
};