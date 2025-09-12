const { v4: uuidv4 } = require('uuid');

function socketHandler(io, documents, getOrCreateDocument) {
  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);
    
    let currentDocumentId = null;
    const userId = uuidv4();
    
    // Assign a random username (in a real app this would come from authentication)
    const username = `User-${Math.floor(Math.random() * 1000)}`;
    
    // Handle client joining a document
    socket.on('join-document', (documentId, callback) => {
      // Leave the current document if already in one
      if (currentDocumentId) {
        socket.leave(currentDocumentId);
        const doc = documents[currentDocumentId];
        if (doc) {
          const updatedUsers = doc.removeUser(userId);
          socket.to(currentDocumentId).emit('user-left', { userId, users: updatedUsers });
        }
      }
      
      // Join the new document
      currentDocumentId = documentId;
      socket.join(documentId);
      
      // Get or create the document
      const document = getOrCreateDocument(documentId);
      
      // Add user to the document's active users
      const userData = { userId, username, color: getRandomColor() };
      const activeUsers = document.addUser(userId, userData);
      
      // Broadcast to other users that a new user joined
      socket.to(documentId).emit('user-joined', { user: userData, users: activeUsers });
      
      // Send document state to the client
      const documentState = document.getState();
      callback({
        document: documentState,
        user: userData,
        users: activeUsers
      });
      
      console.log(`User ${userId} (${username}) joined document ${documentId}`);
    });
    
    // Handle text changes from clients
    socket.on('text-change', (data) => {
      if (!currentDocumentId) return;
      
      const { change, version } = data;
      const document = documents[currentDocumentId];
      
      if (!document) return;
      
      // Apply the change
      const result = document.applyChange(change, userId);
      
      if (result.success) {
        // Broadcast the change to all other clients in the document
        socket.to(currentDocumentId).emit('text-change', {
          change,
          userId,
          version: result.version
        });
      } else {
        // Send error back to the client
        socket.emit('change-error', {
          error: result.error,
          version: document.version
        });
      }
    });
    
    // Handle cursor/selection changes
    socket.on('selection-change', (selection) => {
      if (!currentDocumentId) return;
      
      socket.to(currentDocumentId).emit('selection-change', {
        userId,
        selection
      });
    });
    
    // Handle document title changes
    socket.on('update-title', (title) => {
      if (!currentDocumentId) return;
      
      const document = documents[currentDocumentId];
      if (document) {
        document.title = title;
        document.updatedAt = new Date();
        
        socket.to(currentDocumentId).emit('title-updated', {
          title,
          userId
        });
      }
    });
    
    // Handle client disconnect
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      
      if (currentDocumentId && documents[currentDocumentId]) {
        const document = documents[currentDocumentId];
        const updatedUsers = document.removeUser(userId);
        
        socket.to(currentDocumentId).emit('user-left', {
          userId,
          users: updatedUsers
        });
        
        console.log(`User ${userId} (${username}) left document ${currentDocumentId}`);
      }
    });
    
    // Handle explicit document leave
    socket.on('leave-document', () => {
      if (currentDocumentId && documents[currentDocumentId]) {
        const document = documents[currentDocumentId];
        const updatedUsers = document.removeUser(userId);
        
        socket.to(currentDocumentId).emit('user-left', {
          userId,
          users: updatedUsers
        });
        
        socket.leave(currentDocumentId);
        currentDocumentId = null;
        
        console.log(`User ${userId} (${username}) left document explicitly`);
      }
    });
  });
}

// Helper function to generate a random color for user
function getRandomColor() {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA5A5', '#9055A2',
    '#6E7582', '#D499B9', '#2B90D9', '#8BD155', '#F9C22E'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

module.exports = socketHandler;
