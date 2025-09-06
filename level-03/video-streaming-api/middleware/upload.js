const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { ErrorResponse } = require('../utils/errorHandler');
const config = require('../config');

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(config.VIDEO_STORAGE_PATH, 'raw'));
  },
  filename: function (req, file, cb) {
    // Create unique file name with original extension
    const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, fileName);
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Check if file extension is allowed
  const ext = path.extname(file.originalname).toLowerCase();
  if (config.ALLOWED_VIDEO_FORMATS.includes(ext)) {
    return cb(null, true);
  }
  
  cb(
    new ErrorResponse(
      `Please upload a valid video file. Supported formats: ${config.ALLOWED_VIDEO_FORMATS.join(', ')}`,
      400
    ),
    false
  );
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: config.MAX_VIDEO_SIZE },
  fileFilter: fileFilter
});

module.exports = {
  uploadVideo: upload.single('video')
};
