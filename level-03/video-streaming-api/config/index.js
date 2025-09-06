require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/video-streaming-api',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d',
  REDIS_URL: process.env.REDIS_URL,
  FFMPEG_PATH: process.env.FFMPEG_PATH || '/usr/bin/ffmpeg',
  VIDEO_STORAGE_PATH: process.env.VIDEO_STORAGE_PATH || './videos',
  THUMBNAIL_STORAGE_PATH: process.env.THUMBNAIL_STORAGE_PATH || './thumbnails',
  MAX_VIDEO_SIZE: process.env.MAX_VIDEO_SIZE || 1024 * 1024 * 100, // 100MB
  ALLOWED_VIDEO_FORMATS: ['.mp4', '.avi', '.mov', '.mkv', '.webm'],
  STREAM_QUALITIES: [
    { name: '1080p', resolution: '1920x1080', bitrate: '4500k' },
    { name: '720p', resolution: '1280x720', bitrate: '2500k' },
    { name: '480p', resolution: '854x480', bitrate: '1000k' },
    { name: '360p', resolution: '640x360', bitrate: '500k' }
  ]
};
