const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const logger = require('../utils/logger');

const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);

// Set FFmpeg path if provided in config
if (config.FFMPEG_PATH) {
  ffmpeg.setFfmpegPath(config.FFMPEG_PATH);
}

/**
 * Process video for HLS streaming
 * @param {Object} video - Video object from MongoDB
 * @returns {Promise<Object>} - Updated video object with HLS paths
 */
exports.processVideoForHLS = async (video) => {
  try {
    // Create directory for processed video
    const outputDir = path.join(config.VIDEO_STORAGE_PATH, 'processed', video._id.toString());
    
    if (!await exists(outputDir)) {
      await mkdir(outputDir, { recursive: true });
    }

    // Create M3U8 playlist for each quality
    const playlistPath = path.join(outputDir, 'playlist.m3u8');
    const qualities = [];

    // Get video metadata
    const metadata = await getVideoMetadata(path.join(config.VIDEO_STORAGE_PATH, 'raw', video.fileName));

    // Create streams for each quality
    const streams = config.STREAM_QUALITIES.map(quality => {
      // Skip higher qualities if source video is of lower resolution
      if (metadata.width && metadata.height) {
        const [targetWidth, targetHeight] = quality.resolution.split('x').map(Number);
        if (metadata.width < targetWidth || metadata.height < targetHeight) {
          return null;
        }
      }

      const qualityDir = path.join(outputDir, quality.name);
      const qualityPlaylist = path.join(qualityDir, 'index.m3u8');
      
      qualities.push({
        name: quality.name,
        path: path.relative(config.VIDEO_STORAGE_PATH, qualityPlaylist),
        resolution: quality.resolution,
        bitrate: quality.bitrate
      });

      return {
        output: qualityPlaylist,
        videoCodec: 'libx264',
        videoBitrate: quality.bitrate,
        audioCodec: 'aac',
        audioBitrate: '128k',
        size: quality.resolution,
        outputOptions: [
          '-hls_time 10',
          '-hls_playlist_type vod',
          '-hls_segment_filename', path.join(qualityDir, 'segment_%03d.ts'),
          '-f hls'
        ]
      };
    }).filter(Boolean);

    // Create master playlist with all qualities
    await createMasterPlaylist(playlistPath, qualities, metadata.duration);

    // Process video for each quality
    await Promise.all(streams.map(async (stream) => {
      // Create directory for quality
      const qualityDir = path.dirname(stream.output);
      if (!await exists(qualityDir)) {
        await mkdir(qualityDir, { recursive: true });
      }
      
      // Process video
      await transcodeVideo(
        path.join(config.VIDEO_STORAGE_PATH, 'raw', video.fileName),
        stream
      );
    }));

    // Generate thumbnail
    const thumbnailFileName = `${uuidv4()}.jpg`;
    const thumbnailPath = path.join(config.THUMBNAIL_STORAGE_PATH, thumbnailFileName);
    
    await generateThumbnail(
      path.join(config.VIDEO_STORAGE_PATH, 'raw', video.fileName),
      thumbnailPath
    );

    // Update video in database
    return {
      processed: true,
      thumbnailPath: path.relative(config.THUMBNAIL_STORAGE_PATH, thumbnailPath),
      duration: metadata.duration,
      qualities
    };
  } catch (error) {
    logger.error(`Error processing video: ${error.message}`);
    throw new Error(`Video processing failed: ${error.message}`);
  }
};

/**
 * Get video metadata using FFmpeg
 * @param {string} videoPath - Path to video file
 * @returns {Promise<Object>} - Video metadata
 */
const getVideoMetadata = (videoPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        return reject(err);
      }

      const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
      
      resolve({
        duration: metadata.format.duration,
        width: videoStream ? videoStream.width : null,
        height: videoStream ? videoStream.height : null,
        bitrate: metadata.format.bit_rate
      });
    });
  });
};

/**
 * Transcode video using FFmpeg
 * @param {string} inputPath - Path to input video
 * @param {Object} options - Transcoding options
 * @returns {Promise<void>}
 */
const transcodeVideo = (inputPath, options) => {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath)
      .videoCodec(options.videoCodec)
      .videoBitrate(options.videoBitrate)
      .audioCodec(options.audioCodec)
      .audioBitrate(options.audioBitrate);

    if (options.size) {
      command = command.size(options.size);
    }

    if (options.outputOptions) {
      command = command.outputOptions(options.outputOptions);
    }

    command
      .output(options.output)
      .on('end', () => {
        logger.info(`Successfully transcoded video to ${options.output}`);
        resolve();
      })
      .on('error', (err) => {
        logger.error(`Error transcoding video: ${err.message}`);
        reject(err);
      })
      .run();
  });
};

/**
 * Generate video thumbnail
 * @param {string} videoPath - Path to video file
 * @param {string} thumbnailPath - Path to save thumbnail
 * @returns {Promise<void>}
 */
const generateThumbnail = (videoPath, thumbnailPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        count: 1,
        folder: path.dirname(thumbnailPath),
        filename: path.basename(thumbnailPath),
        size: '640x360'
      })
      .on('end', () => {
        logger.info(`Successfully generated thumbnail at ${thumbnailPath}`);
        resolve();
      })
      .on('error', (err) => {
        logger.error(`Error generating thumbnail: ${err.message}`);
        reject(err);
      });
  });
};

/**
 * Create master HLS playlist
 * @param {string} playlistPath - Path to save master playlist
 * @param {Array} qualities - Array of quality objects
 * @param {number} duration - Video duration in seconds
 * @returns {Promise<void>}
 */
const createMasterPlaylist = async (playlistPath, qualities, duration) => {
  try {
    // Create directory if not exists
    const dir = path.dirname(playlistPath);
    if (!await exists(dir)) {
      await mkdir(dir, { recursive: true });
    }

    // Create master playlist content
    let content = '#EXTM3U\n';
    content += '#EXT-X-VERSION:3\n';
    
    // Add each quality variant
    qualities.forEach(quality => {
      const [width, height] = quality.resolution.split('x');
      const bitrate = parseInt(quality.bitrate.replace('k', '')) * 1000;
      
      content += `#EXT-X-STREAM-INF:BANDWIDTH=${bitrate},RESOLUTION=${quality.resolution}\n`;
      content += `${quality.name}/index.m3u8\n`;
    });

    // Write playlist file
    await promisify(fs.writeFile)(playlistPath, content);
    
    logger.info(`Successfully created master playlist at ${playlistPath}`);
  } catch (error) {
    logger.error(`Error creating master playlist: ${error.message}`);
    throw error;
  }
};
