require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const Document = require('./document');
const socketHandler = require('./socket-handler');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// In-memory document storage
const documents = {};

// Create a new document if it doesn't exist
function getOrCreateDocument(id) {
  if (!documents[id]) {
    documents[id] = new Document(id);
  }
  return documents[id];
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/documents', (req, res) => {
  const documentList = Object.keys(documents).map(id => ({
    id,
    title: documents[id].title || `Document ${id.substr(0, 6)}`,
    createdAt: documents[id].createdAt,
    updatedAt: documents[id].updatedAt
  }));
  res.json(documentList);
});

app.get('/documents/:id', (req, res) => {
  const id = req.params.id;
  const doc = getOrCreateDocument(id);
  res.json({
    id: doc.id,
    title: doc.title || `Document ${id.substr(0, 6)}`,
    content: doc.content,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  });
});

app.post('/documents', (req, res) => {
  const id = uuidv4();
  const { title } = req.body;
  const doc = getOrCreateDocument(id);
  
  if (title) {
    doc.title = title;
  }
  
  res.status(201).json({
    id: doc.id,
    title: doc.title || `Document ${id.substr(0, 6)}`,
    content: doc.content,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  });
});

// Initialize Socket.IO handlers
socketHandler(io, documents, getOrCreateDocument);

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server shut down successfully');
    process.exit(0);
  });
});

module.exports = { app, server };
