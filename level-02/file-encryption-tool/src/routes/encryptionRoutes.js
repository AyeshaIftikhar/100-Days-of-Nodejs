const express = require('express');
const router = express.Router();
const encryptionController = require('../controllers/encryptionController');
const fileValidation = require('../middlewares/fileValidation');
const asyncHandler = require('../utils/asyncHandler');

router.post(
  '/',
  fileValidation,
  asyncHandler(encryptionController.encryptFile)
);

router.post(
  '/decrypt/:filename',
  asyncHandler(encryptionController.decryptFile)
);

module.exports = router;