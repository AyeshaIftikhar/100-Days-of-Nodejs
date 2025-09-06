const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const asyncHandler = require('express-async-handler');
const Video = require('../models/Video');
const { ErrorResponse } = require('../utils/errorHandler');
const { processVideoForHLS } = require('../services/videoProcessingService');
const { streamVideo, getVideoThumbnail, updateVideoAnalytics } = require('../services/streamService');

const unlink = promisify(fs.unlink);

// @desc    Upload a video
// @route   POST /api/videos
// @access  Private
exports.uploadVideo = asyncHandler(async (req, res, next) => {
  // Check if file was uploaded
  if (!req.file) {
    return next(new ErrorResponse('Please upload a video file', 400));
  }

  // Check if title was provided
  if (!req.body.title) {
    return next(new ErrorResponse('Please provide a title for the video', 400));
  }

  // Create video document
  const video = await Video.create({
    title: req.body.title,
    description: req.body.description || '',
    originalFileName: req.file.originalname,
    fileName: req.file.filename,
    size: req.file.size,
    format: path.extname(req.file.originalname).substring(1),
    owner: req.user.id,
    isPublic: req.body.isPublic !== 'false' // Default to true unless explicitly set to false
  });

  // Process video in background
  processVideo(video._id);

  res.status(201).json({
    success: true,
    data: video
  });
});

// @desc    Get all videos
// @route   GET /api/videos
// @access  Public
exports.getVideos = asyncHandler(async (req, res, next) => {
  // Build query
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Find public videos or all videos if user is admin
  if (req.user && req.user.role === 'admin') {
    query = Video.find(JSON.parse(queryStr));
  } else if (req.user) {
    // Find public videos or videos owned by the current user
    query = Video.find({
      $or: [
        { isPublic: true },
        { owner: req.user.id }
      ],
      ...JSON.parse(queryStr)
    });
  } else {
    // Only public videos for non-authenticated users
    query = Video.find({
      isPublic: true,
      ...JSON.parse(queryStr)
    });
  }

  // Select fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Video.countDocuments(query);

  query = query.skip(startIndex).limit(limit);

  // Execute query
  const videos = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: videos.length,
    pagination,
    data: videos
  });
});

// @desc    Get single video
// @route   GET /api/videos/:id
// @access  Public/Private (depending on video visibility)
exports.getVideo = asyncHandler(async (req, res, next) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    return next(new ErrorResponse(`Video not found with id of ${req.params.id}`, 404));
  }

  // Make sure video is public or user owns the video
  if (!video.isPublic && (!req.user || (req.user.id !== video.owner.toString() && req.user.role !== 'admin'))) {
    return next(new ErrorResponse(`Not authorized to access this video`, 403));
  }

  res.status(200).json({
    success: true,
    data: video
  });
});

// @desc    Update video
// @route   PUT /api/videos/:id
// @access  Private
exports.updateVideo = asyncHandler(async (req, res, next) => {
  let video = await Video.findById(req.params.id);

  if (!video) {
    return next(new ErrorResponse(`Video not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the video or is admin
  if (video.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this video`, 403));
  }

  // Only allow certain fields to be updated
  const allowedFields = ['title', 'description', 'isPublic'];
  const updateData = {};

  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updateData[key] = req.body[key];
    }
  });

  video = await Video.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: video
  });
});

// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Private
exports.deleteVideo = asyncHandler(async (req, res, next) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    return next(new ErrorResponse(`Video not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the video or is admin
  if (video.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this video`, 403));
  }

  // Delete video files
  try {
    // Delete raw video file
    const rawVideoPath = path.join(process.cwd(), 'videos', 'raw', video.fileName);
    if (fs.existsSync(rawVideoPath)) {
      await unlink(rawVideoPath);
    }

    // Delete processed video directory
    const processedDir = path.join(process.cwd(), 'videos', 'processed', video._id.toString());
    if (fs.existsSync(processedDir)) {
      fs.rmSync(processedDir, { recursive: true, force: true });
    }

    // Delete thumbnail if exists
    if (video.thumbnailPath) {
      const thumbnailPath = path.join(process.cwd(), 'thumbnails', video.thumbnailPath);
      if (fs.existsSync(thumbnailPath)) {
        await unlink(thumbnailPath);
      }
    }
  } catch (err) {
    console.error('Error deleting video files:', err);
    // Continue with deletion even if file removal fails
  }

  await video.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Stream video (HLS)
// @route   GET /api/videos/:id/stream
// @route   GET /api/videos/:id/stream/*
// @access  Public/Private (depending on video visibility)
exports.streamVideo = streamVideo;

// @desc    Get video thumbnail
// @route   GET /api/videos/:id/thumbnail
// @access  Public/Private (depending on video visibility)
exports.getVideoThumbnail = getVideoThumbnail;

// @desc    Record video analytics
// @route   POST /api/videos/:id/analytics
// @access  Public/Private (depending on video visibility)
exports.recordAnalytics = asyncHandler(async (req, res, next) => {
  const { watchTime } = req.body;

  if (!watchTime || isNaN(parseFloat(watchTime))) {
    return next(new ErrorResponse('Please provide a valid watch time', 400));
  }

  const video = await Video.findById(req.params.id);

  if (!video) {
    return next(new ErrorResponse(`Video not found with id of ${req.params.id}`, 404));
  }

  // Make sure video is public or user owns the video
  if (!video.isPublic && (!req.user || (req.user.id !== video.owner.toString() && req.user.role !== 'admin'))) {
    return next(new ErrorResponse(`Not authorized to access this video`, 403));
  }

  // Update analytics
  await updateVideoAnalytics(req.params.id, parseFloat(watchTime));

  res.status(200).json({
    success: true,
    data: {}
  });
});

// Process video in background
const processVideo = async (videoId) => {
  try {
    const video = await Video.findById(videoId);
    
    if (!video) {
      console.error(`Video not found for processing: ${videoId}`);
      return;
    }

    // Process video
    const updatedData = await processVideoForHLS(video);
    
    // Update video in database
    await Video.findByIdAndUpdate(videoId, updatedData);

    console.log(`Video processing completed for ${videoId}`);
  } catch (err) {
    console.error(`Error processing video ${videoId}:`, err);
    
    // Update video with error
    await Video.findByIdAndUpdate(videoId, {
      processed: false,
      processingError: err.message
    });
  }
};
