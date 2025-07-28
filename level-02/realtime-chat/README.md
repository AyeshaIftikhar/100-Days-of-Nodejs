# Real-Time Chat Application with Socket.io

A full-featured real-time chat application built with Node.js and Socket.io.

## Features

- **Real-Time Messaging**: Instant message delivery
- **Private Chats**: One-to-one conversations
- **Group Chats**: Multi-user conversations
- **Online Status**: See who's online
- **Typing Indicators**: Know when others are typing
- **Message History**: View past conversations
- **Read Receipts**: See when messages are read
- **Authentication**: JWT-based user authentication

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login

### Chat
- `GET /api/v1/chat/rooms` - Get user's chat rooms
- `GET /api/v1/chat/messages/:roomId` - Get message history
- `POST /api/v1/chat/group` - Create group chat

## Socket Events

### Connection
- `user-online` - Notify when user comes online
- `user-status-changed` - Broadcast user status changes

### Private Chat
- `join-private-chat` - Join private chat room
- `private-message` - Send private message
- `new-private-message` - Receive new private message
- `typing-private` - Notify when user is typing
- `user-typing-private` - Receive typing notification

### Group Chat
- `join-group-chat` - Join group chat room
- `group-message` - Send group message
- `new-group-message` - Receive new group message
- `typing-group` - Notify when user is typing in group
- `user-typing-group` - Receive group typing notification

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on the example
4. Start MongoDB server
5. Run the application: `npm run dev`

## Environment Variables

- `PORT` - Server port (default: 3000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT signing
- `CLIENT_URL` - URL of client application for CORS
- `JWT_EXPIRES_IN` - JWT expiration time (e.g., "1d")

## Client Implementation

Example client-side Socket.io connection:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

// Join private chat
socket.emit('join-private-chat', roomId);

// Send private message
socket.emit('private-message', { roomId, content: 'Hello!' });

// Listen for new messages
socket.on('new-private-message', (message) => {
  console.log('New message:', message);
});

// Typing indicator
let typingTimeout;

const onTyping = () => {
  socket.emit('typing-private', roomId);
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('stop-typing-private', roomId);
  }, 2000);
};