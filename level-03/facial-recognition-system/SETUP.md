# Facial Recognition System - Setup Guide

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- Modern web browser with camera access (Chrome, Firefox, Safari, Edge)
- **Git** (optional, for cloning)

## Quick Start Guide

### 1. Project Setup

```bash
# Navigate to the project directory
cd facial-recognition-system

# You'll see two main directories:
# - backend/  (Node.js + Express API)
# - frontend/ (React + Vite application)
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit the .env file with your configuration (optional for development)
# Default values work for local development

# Build the TypeScript code
npm run build

# Initialize the database
npm run db:init

# Start the development server
npm run dev
```

The backend API will be available at: `http://localhost:3001`

### 3. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend application will be available at: `http://localhost:5173`

### 4. Access the Application

1. Open your browser and go to `http://localhost:5173`
2. Allow camera access when prompted
3. Start using the facial recognition system!

## Development Commands

### Backend Commands

```bash
# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Initialize/Reset database
npm run db:init

# Run tests
npm test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Frontend Commands

```bash
# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Environment Configuration

### Backend Environment Variables (.env)

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Database
DB_PATH=./database/facial_recognition.db

# JWT (for future authentication features)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Face Recognition Settings
FACE_DETECTION_THRESHOLD=0.5
FACE_RECOGNITION_THRESHOLD=0.6

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables (optional)

Create a `.env` file in the frontend directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
```

## Project Structure

```
facial-recognition-system/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── utils/          # Utility functions
│   │   ├── types/          # TypeScript types
│   │   └── scripts/        # Database scripts
│   ├── uploads/            # Uploaded files
│   ├── database/           # SQLite database
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and API
│   │   ├── types/          # TypeScript types
│   │   └── hooks/          # Custom hooks
│   ├── public/             # Static assets
│   └── package.json
└── README.md
```

## API Endpoints

### Users
- `POST /api/users` - Register new user with face data
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PUT /api/users/:id/face` - Update user's face data

### Face Recognition
- `GET /api/face/models` - Load face detection models
- `POST /api/face/recognize` - Recognize face from image
- `POST /api/face/verify` - Verify face against specific user
- `POST /api/face/detect` - Detect face in image

### Attendance
- `POST /api/attendance/checkin` - Record check-in
- `POST /api/attendance/checkout` - Record check-out
- `GET /api/attendance/logs` - Get attendance logs
- `GET /api/attendance/stats` - Get attendance statistics
- `GET /api/attendance/user/:userId` - Get user attendance history

## Troubleshooting

### Common Issues

1. **Camera not working**
   - Ensure you're using HTTPS or localhost
   - Grant camera permissions in browser
   - Check if camera is being used by another application

2. **Face detection not working**
   - Ensure good lighting conditions
   - Position face clearly in camera frame
   - Wait for face detection models to load

3. **Backend connection issues**
   - Check if backend server is running on port 3001
   - Verify CORS settings in backend
   - Check network connectivity

4. **Database issues**
   - Run `npm run db:init` to reset database
   - Check database file permissions
   - Ensure SQLite is properly installed

5. **Build/Install issues**
   - Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### Performance Tips

1. **For better face recognition accuracy:**
   - Use good lighting
   - Position face directly toward camera
   - Avoid wearing masks or glasses during registration
   - Register multiple angles if needed

2. **For better system performance:**
   - Close other camera applications
   - Use modern browser versions
   - Ensure stable internet connection
   - Optimize image sizes

## Browser Compatibility

### Recommended Browsers
- Chrome 80+ ✅
- Firefox 75+ ✅
- Safari 13+ ✅
- Edge 80+ ✅

### Required Browser Features
- WebRTC (for camera access)
- ES2020 support
- WebAssembly (for face-api.js)
- File API

## Security Considerations

### Development
- Default settings are for development only
- Change JWT secret in production
- Use HTTPS in production
- Implement proper authentication

### Production Deployment
- Use environment variables for secrets
- Enable HTTPS/TLS
- Implement rate limiting
- Regular security updates
- Data encryption at rest

## Next Steps

1. **Test the basic functionality:**
   - Register a user with face data
   - Test face recognition
   - Try attendance tracking

2. **Customize for your needs:**
   - Modify UI colors and branding
   - Add custom fields to user model
   - Implement additional features

3. **Deploy to production:**
   - Set up production database
   - Configure production environment
   - Deploy to cloud platform

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the browser console for errors
3. Check backend logs for API issues
4. Ensure all dependencies are properly installed

For development questions or issues, please refer to the documentation of the underlying technologies:
- [Node.js](https://nodejs.org/docs/)
- [React](https://reactjs.org/docs/)
- [face-api.js](https://github.com/justadudewhohacks/face-api.js)
- [Express.js](https://expressjs.com/)
