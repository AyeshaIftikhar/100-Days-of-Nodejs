const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const asyncHandler = require('../utils/asyncHandler');

router.get(
  '/',
  asyncHandler(fileController.listFiles)
);

router.get(
  '/download/:filename',
  asyncHandler(fileController.downloadFile)
);

module.exports = router;