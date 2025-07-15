const express = require('express');
const router = express.Router();
const { singleUpload, multiUpload, trackProgress } = require('../middlewares/upload');
const { getFileInfo } = require('../utils/helpers');
const fs = require('fs');
const path = require('path');

// Single file upload
router.post('/single', trackProgress, singleUpload, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  res.json({
    message: 'File uploaded successfully',
    file: getFileInfo(req.file),
    progress: 100
  });
});

// Multiple files upload
router.post('/multiple', trackProgress, multiUpload, (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  
  res.json({
    message: 'Files uploaded successfully',
    files: req.files.map(file => getFileInfo(file)),
    progress: 100
  });
});

// Progress endpoint
router.get('/progress', (req, res) => {
  res.json({ progress: req.uploadProgress || 0 });
});

// Download endpoint
router.get('/download/:filename', (req, res) => {
  const filePath = path.join(process.cwd(), 'uploads', req.params.filename);
  
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.download(filePath);
  });
});

module.exports = router;