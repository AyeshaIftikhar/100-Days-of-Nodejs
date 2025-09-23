const express = require('express');
const multer = require('multer');
const router = express.Router();

// Configure multer for file uploads (in production, use cloud storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only images and documents
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and documents are allowed.'));
    }
  }
});

// Mock IPFS storage (in production, use actual IPFS)
const ipfsFiles = new Map();

// POST /api/metadata/upload - Upload file to IPFS
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // In production, upload to IPFS and get actual hash
    const mockIpfsHash = `Qm${Math.random().toString(36).substring(2, 48)}`;
    
    // Store file data (in production, this would be on IPFS)
    ipfsFiles.set(mockIpfsHash, {
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname,
      size: req.file.size,
      uploadedAt: new Date()
    });

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        ipfsHash: mockIpfsHash,
        filename: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        url: `${req.protocol}://${req.get('host')}/api/metadata/file/${mockIpfsHash}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: error.message
    });
  }
});

// GET /api/metadata/file/:hash - Retrieve file from IPFS
router.get('/file/:hash', (req, res) => {
  try {
    const { hash } = req.params;
    const file = ipfsFiles.get(hash);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.set({
      'Content-Type': file.mimetype,
      'Content-Length': file.size,
      'Content-Disposition': `inline; filename="${file.originalname}"`
    });

    res.send(file.buffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving file',
      error: error.message
    });
  }
});

// POST /api/metadata/json - Store JSON metadata on IPFS
router.post('/json', (req, res) => {
  try {
    const metadata = req.body;

    if (!metadata || typeof metadata !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON metadata'
      });
    }

    // In production, upload JSON to IPFS
    const mockIpfsHash = `Qm${Math.random().toString(36).substring(2, 48)}`;
    
    // Store metadata
    ipfsFiles.set(mockIpfsHash, {
      buffer: Buffer.from(JSON.stringify(metadata, null, 2)),
      mimetype: 'application/json',
      originalname: 'metadata.json',
      size: JSON.stringify(metadata).length,
      uploadedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Metadata stored successfully',
      data: {
        ipfsHash: mockIpfsHash,
        url: `${req.protocol}://${req.get('host')}/api/metadata/json/${mockIpfsHash}`,
        metadata
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error storing metadata',
      error: error.message
    });
  }
});

// GET /api/metadata/json/:hash - Retrieve JSON metadata from IPFS
router.get('/json/:hash', (req, res) => {
  try {
    const { hash } = req.params;
    const file = ipfsFiles.get(hash);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Metadata not found'
      });
    }

    const metadata = JSON.parse(file.buffer.toString());

    res.json({
      success: true,
      data: metadata
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving metadata',
      error: error.message
    });
  }
});

// GET /api/metadata/files - List all uploaded files (admin only)
router.get('/files', (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const files = Array.from(ipfsFiles.entries()).map(([hash, file]) => ({
      hash,
      filename: file.originalname,
      size: file.size,
      type: file.mimetype,
      uploadedAt: file.uploadedAt,
      url: `${req.protocol}://${req.get('host')}/api/metadata/file/${hash}`
    }));

    // Sort by upload date (newest first)
    files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    // Apply pagination
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedFiles = files.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedFiles,
      pagination: {
        total: files.length,
        offset: startIndex,
        limit: parseInt(limit),
        hasMore: endIndex < files.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error listing files',
      error: error.message
    });
  }
});

// DELETE /api/metadata/file/:hash - Delete file from IPFS (admin only)
router.delete('/file/:hash', (req, res) => {
  try {
    const { hash } = req.params;
    
    if (!ipfsFiles.has(hash)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    ipfsFiles.delete(hash);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message
    });
  }
});

// POST /api/metadata/pin/:hash - Pin file to ensure persistence (IPFS feature)
router.post('/pin/:hash', (req, res) => {
  try {
    const { hash } = req.params;
    
    if (!ipfsFiles.has(hash)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // In production, pin to IPFS node
    res.json({
      success: true,
      message: 'File pinned successfully',
      data: {
        hash,
        pinned: true,
        pinnedAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error pinning file',
      error: error.message
    });
  }
});

module.exports = router;
