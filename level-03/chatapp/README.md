# ChatApp - Real-time Voice & Video Chat

A comprehensive real-time communication platform built with Node.js that enables text messaging, voice calls, and video conferencing.

## Features

- **User Authentication** - Secure registration and login system
- **Real-time Messaging** - Instant text communication
- **Voice & Video Calls** - WebRTC-powered calling functionality
- **Rooms & Channels** - Public and private group conversations
- **Direct Messaging** - One-on-one private communication
- **Online Presence** - See when users are online, away, or busy
- **Typing Indicators** - Know when someone is typing a message
- **Responsive Design** - Works on desktop and mobile devices

## Technology Stack

- **Backend**
  - Node.js & Express.js - Server framework
  - MongoDB - Database
  - Socket.io - Real-time communication
  - JWT - Authentication
  - WebRTC - Voice and video calls

- **Frontend**
  - HTML5, CSS3, JavaScript
  - Socket.io client
  - WebRTC API

## Prerequisites

- Node.js (v14.x or higher)
- MongoDB (v4.x or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/chatapp.git
   cd chatapp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/chatapp
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. For development with auto-restart:
   ```bash
   npm run dev
   ```

6. Access the application at http://localhost:3000

## Project Structure

```
chatapp/
├── config/             # Configuration files
├── controllers/        # Route controllers
├── middleware/         # Custom middleware
├── models/             # Database models
├── public/             # Static assets
│   ├── css/            # Stylesheets
│   ├── js/             # Client-side JavaScript
│   └── audio/          # Audio files (ringtones, etc.)
├── routes/             # API routes
├── services/           # Business logic
├── views/              # EJS templates
├── .env                # Environment variables
├── package.json        # Project metadata
└── server.js           # Application entry point
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:id/password` - Update password

### Rooms
- `POST /api/rooms` - Create a new room
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get room by ID
- `PUT /api/rooms/:id` - Update room
- `POST /api/rooms/:id/participants` - Add participants
- `DELETE /api/rooms/:id/leave` - Leave room
- `GET /api/rooms/:id/messages` - Get room messages

## Socket.io Events

### Connection
- `connected` - Client connected to server
- `error` - Error event

### Messaging
- `sendMessage` - Send a message
- `newMessage` - New message received
- `typing` - User is typing
- `stopTyping` - User stopped typing

### Rooms
- `joinRoom` - Join a room
- `leaveRoom` - Leave a room
- `userJoined` - User joined a room
- `userLeft` - User left a room

### User Status
- `userStatusChanged` - User status changed
- `changeStatus` - Change user status

### WebRTC Signaling
- `webrtc-offer` - WebRTC offer
- `webrtc-answer` - WebRTC answer
- `webrtc-ice-candidate` - WebRTC ICE candidate
- `webrtc-call-request` - Call request
- `webrtc-call-response` - Call response
- `webrtc-hang-up` - Hang up call

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- XSS protection
- CORS configuration
- Input validation
- Secure WebRTC signaling

## Future Enhancements

1. **End-to-End Encryption** - Implement secure messaging with end-to-end encryption
2. **File Sharing** - Allow users to share files in chat rooms
3. **Message Search** - Add ability to search through messages
4. **Read Receipts** - Show when messages have been read
5. **Push Notifications** - Implement notifications for messages and calls
6. **Screen Sharing** - Add screen sharing functionality for video calls
7. **Message Reactions** - Add emoji reactions to messages
8. **User Profiles** - Enhanced user profiles with more information
9. **Group Video Calls** - Support for multi-user video conferences
10. **Admin Controls** - Moderation tools for room administrators
11. **Mobile App** - Develop mobile applications using React Native or Flutter
12. **Message Translation** - Real-time translation of messages between different languages

## Troubleshooting

Common issues and their solutions:

1. **Connection Issues**
   - Ensure MongoDB is running
   - Check environment variables are set correctly

2. **WebRTC Call Problems**
   - Make sure your browser supports WebRTC
   - Allow camera and microphone permissions
   - Check network connectivity and firewall settings

3. **Socket Connection Errors**
   - Verify that the Socket.io client and server versions are compatible
   - Check for CORS issues if accessing from a different domain

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Socket.io for real-time communication
- WebRTC for peer-to-peer voice and video
- MongoDB for database
- Express.js for API framework
- All the open-source libraries used in this project
