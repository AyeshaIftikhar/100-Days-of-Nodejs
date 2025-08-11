const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const WSServer = require('./wsHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the client/public directory
app.use(express.static(path.join(__dirname, '../client/public')));

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to access the game`);
  console.log('Press Ctrl+C to stop the server');
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Initialize WebSocket handler
const wsHandler = new WSServer(wss);