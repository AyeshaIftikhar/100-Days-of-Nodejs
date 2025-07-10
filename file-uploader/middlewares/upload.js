const multer = require('multer');
const path = require('path');
const config = require('../config/upload');
const { generateRandomString } = require('../utils/helpers');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const randomName = generateRandomString(16);
    cb(null, `${randomName}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (config.ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.MAX_FILE_SIZE,
    files: config.MAX_FILES
  }
});

// Progress tracking middleware
const trackProgress = (req, res, next) => {
  let progress = 0;
  const fileSize = req.headers['content-length'];
  
  req.on('data', (chunk) => {
    progress += chunk.length;
    const percent = Math.round((progress / fileSize) * 100);
    req.uploadProgress = percent;
  });
  
  next();
};

module.exports = {
  singleUpload: upload.single('file'),
  multiUpload: upload.array('files', config.MAX_FILES),
  trackProgress
};