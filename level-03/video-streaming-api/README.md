# Video Streaming API (HLS)

A Node.js-based video streaming service that converts and serves videos using HTTP Live Streaming (HLS) protocol. This project demonstrates how to build a robust and scalable video streaming solution that adapts to different network conditions and device capabilities.

## Problem Statement

Video streaming services face several challenges:
- Delivering high-quality video across varying network conditions
- Supporting multiple device types with different capabilities
- Efficiently managing server resources during high traffic
- Providing secure access to video content

This project addresses these challenges by implementing HLS streaming, which splits videos into small segments and serves them with an adaptive bitrate approach.

## Features

- Video upload and storage
- On-demand video transcoding to multiple qualities (1080p, 720p, 480p, 360p)
- HLS streaming with adaptive bitrate
- Video thumbnail generation
- Basic authentication and authorization
- Video metadata management
- Stream analytics (views, watch time)

## Tech Stack

- Node.js & Express.js
- FFmpeg for video processing
- MongoDB for metadata storage
- Redis for caching
- JWT for authentication

## Prerequisites

- Node.js (v14+)
- FFmpeg installed on your system
- MongoDB
- Redis (optional, for enhanced caching)

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Create a `videos` and `thumbnails` directory in the project root:
   ```
   mkdir -p videos/raw videos/processed thumbnails
   ```
5. Start the server:
   ```
   npm start
   ```
   
## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get token

### Videos
- `POST /api/videos` - Upload a new video
- `GET /api/videos` - List all videos
- `GET /api/videos/:id` - Get video metadata
- `DELETE /api/videos/:id` - Delete a video
- `GET /api/videos/:id/stream` - Stream a video (HLS)
- `GET /api/videos/:id/thumbnail` - Get video thumbnail

## Usage Example

### Upload a video
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" -F "video=@path/to/your/video.mp4" -F "title=My Video" -F "description=Video description" http://localhost:3000/api/videos
```

### Stream a video
Open in a browser or HLS-compatible player:
```
http://localhost:3000/api/videos/VIDEO_ID/stream
```

## Project Structure

```
video-streaming-api/
├── config/
│   ├── db.js
│   └── index.js
├── controllers/
│   ├── authController.js
│   └── videoController.js
├── middleware/
│   ├── auth.js
│   └── upload.js
├── models/
│   ├── User.js
│   └── Video.js
├── routes/
│   ├── auth.js
│   └── videos.js
├── services/
│   ├── streamService.js
│   └── videoProcessingService.js
├── utils/
│   ├── errorHandler.js
│   └── logger.js
├── videos/
│   ├── raw/
│   └── processed/
├── thumbnails/
├── .env.example
├── .gitignore
├── app.js
├── package.json
└── README.md
```

## Future Enhancements

1. **Content Delivery Network (CDN) Integration**
   - Integrate with AWS CloudFront or similar CDN for global distribution

2. **Advanced Analytics**
   - Track user engagement, drop-off points, and viewing patterns

3. **DRM (Digital Rights Management)**
   - Implement encryption and content protection

4. **Monetization Features**
   - Pay-per-view or subscription-based access

5. **Live Streaming**
   - Add RTMP ingestion and live HLS output

6. **Personalized Recommendations**
   - Use viewing history to suggest content

7. **Multi-language Support**
   - Subtitles and multiple audio tracks

8. **Social Features**
   - Comments, likes, and sharing capabilities

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
