const express = require('express');
const { 
  uploadVideo,
  getVideos,
  getVideo,
  updateVideo,
  deleteVideo,
  streamVideo,
  getVideoThumbnail,
  recordAnalytics
} = require('../controllers/videoController');

const { protect } = require('../middleware/auth');
const { uploadVideo: uploadMiddleware } = require('../middleware/upload');

const router = express.Router();

// Public routes (some with conditional access)
router.get('/', getVideos);
router.get('/:id', getVideo);
router.get('/:id/stream', streamVideo);
router.get('/:id/stream/*', streamVideo);
router.get('/:id/thumbnail', getVideoThumbnail);
router.post('/:id/analytics', recordAnalytics);

// Protected routes
router.post('/', protect, uploadMiddleware, uploadVideo);
router.put('/:id', protect, updateVideo);
router.delete('/:id', protect, deleteVideo);

module.exports = router;
