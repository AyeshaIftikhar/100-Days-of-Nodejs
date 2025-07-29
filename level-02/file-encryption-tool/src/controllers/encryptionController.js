const EncryptionService = require('../services/encryptionService');
const StorageService = require('../services/storageService');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

exports.encryptFile = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    throw new ApiError('No file uploaded', 400);
  }

  const { password } = req.body;
  if (!password) {
    throw new ApiError('Password is required for encryption', 400);
  }

  const { originalname, buffer } = req.file;
  const encryptedFile = await EncryptionService.encryptFile(buffer, password);
  const filePath = await StorageService.saveEncryptedFile(originalname, encryptedFile);

  logger.info(`File encrypted: ${originalname}`);

  res.status(200).json({
    status: 'success',
    data: {
      filename: originalname,
      encryptedFilename: filePath.split('/').pop(),
      downloadLink: `/api/v1/files/download/${filePath.split('/').pop()}`
    }
  });
});

exports.decryptFile = asyncHandler(async (req, res, next) => {
  const { filename } = req.params;
  const { password } = req.body;

  if (!password) {
    throw new ApiError('Password is required for decryption', 400);
  }

  const encryptedFile = await StorageService.getEncryptedFile(filename);
  const decryptedFile = await EncryptionService.decryptFile(encryptedFile, password);

  logger.info(`File decrypted: ${filename}`);

  res.set({
    'Content-Disposition': `attachment; filename=${filename.replace('.enc', '')}`,
    'Content-Type': 'application/octet-stream'
  });

  res.send(decryptedFile);
});