const StorageService = require('../services/storageService');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

exports.listFiles = asyncHandler(async (req, res, next) => {
  const files = await StorageService.listEncryptedFiles();
  
  logger.info('Listed encrypted files');
  
  res.status(200).json({
    status: 'success',
    results: files.length,
    data: {
      files
    }
  });
});

exports.downloadFile = asyncHandler(async (req, res, next) => {
  const { filename } = req.params;
  const filePath = await StorageService.getEncryptedFilePath(filename);

  logger.info(`Downloaded file: ${filename}`);

  res.download(filePath);
});