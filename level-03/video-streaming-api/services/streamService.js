const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const config = require('../config');
const logger = require('../utils/logger');
const { ErrorResponse } = require('../utils/errorHandler');
const Video = require('../models/Video');

const readFile = promisify(fs.readFile);
const exists = promisify(fs.exists);

/**
 * Stream video using HLS
 * @param {string} videoId - Video ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.streamVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return next(new ErrorResponse('Video not found', 404));
    }

    // Check if video is public or user is owner
    if (!video.isPublic && (!req.user || req.user.id !== video.owner.toString())) {
      return next(new ErrorResponse('Not authorized to access this video', 403));
    }

    // Check if video is processed
    if (!video.processed) {
      return next(new ErrorResponse('Video is still being processed', 400));
    }

    // Determine which file to serve
    let filePath;
    const requestPath = req.params[0] || 'playlist.m3u8'; // Get path after /stream/
    
    // Check if user requested playlist or segment
    filePath = path.join(config.VIDEO_STORAGE_PATH, 'processed', video._id.toString(), requestPath);

    // Check if file exists
    if (!await exists(filePath)) {
      return next(new ErrorResponse('File not found', 404));
    }

    // Get file extension
    const ext = path.extname(filePath);

    // Set content type based on file extension
    const contentTypes = {
      '.m3u8': 'application/vnd.apple.mpegurl',
      '.ts': 'video/mp2t',
      '.mp4': 'video/mp4'
    };

    // Set appropriate headers
    res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    // For M3U8 playlists, don't cache
    if (ext === '.m3u8') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else {
      // For segments, cache for 1 day
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }

    // For the first playlist request, increment view count
    if (requestPath === 'playlist.m3u8') {
      // Don't await to avoid delaying the response
      video.incrementViews();
    }

    // Stream the file
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    logger.error(`Error streaming video: ${err.message}`);
    return next(new ErrorResponse('Error streaming video', 500));
  }
};

/**
 * Get video thumbnail
 * @param {string} videoId - Video ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getVideoThumbnail = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return next(new ErrorResponse('Video not found', 404));
    }

    // Check if video is public or user is owner
    if (!video.isPublic && (!req.user || req.user.id !== video.owner.toString())) {
      return next(new ErrorResponse('Not authorized to access this video', 403));
    }

    // Check if thumbnail exists
    if (!video.thumbnailPath) {
      return next(new ErrorResponse('Thumbnail not available', 404));
    }

    const thumbnailPath = path.join(config.THUMBNAIL_STORAGE_PATH, video.thumbnailPath);

    // Check if file exists
    if (!await exists(thumbnailPath)) {
      return next(new ErrorResponse('Thumbnail file not found', 404));
    }

    // Set content type
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

    // Stream the file
    fs.createReadStream(thumbnailPath).pipe(res);
  } catch (err) {
    logger.error(`Error serving thumbnail: ${err.message}`);
    return next(new ErrorResponse('Error serving thumbnail', 500));
  }
};

/**
 * Update video analytics
 * @param {string} videoId - Video ID
 * @param {number} watchTime - Watch time in seconds
 */
exports.updateVideoAnalytics = async (videoId, watchTime) => {
  try {
    const video = await Video.findById(videoId);

    if (!video) {
      logger.error(`Video not found for analytics update: ${videoId}`);
      return;
    }

    await video.addWatchTime(watchTime);
    logger.info(`Updated analytics for video ${videoId}: ${watchTime} seconds`);
  } catch (err) {
    logger.error(`Error updating video analytics: ${err.message}`);
  }
};
