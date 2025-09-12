class Document {
  constructor(id, title = '') {
    this.id = id;
    this.title = title;
    this.content = '';
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.version = 0;
    this.history = [];
    this.activeUsers = new Map(); // userId -> user object
  }

  // Apply text change to the document
  applyChange(change, userId) {
    try {
      // Apply the change
      if (change.text !== undefined) {
        this.content = change.text;
      }
      
      // Increment the document version
      this.version++;
      
      // Update the modified timestamp
      this.updatedAt = new Date();
      
      // Store change in history with metadata
      this.history.push({
        change,
        userId,
        timestamp: new Date(),
        version: this.version
      });
      
      return {
        success: true,
        version: this.version,
        content: this.content
      };
    } catch (error) {
      console.error(`Error applying change to document ${this.id}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Add a user to the document's active users
  addUser(userId, userData) {
    this.activeUsers.set(userId, {
      ...userData,
      joinedAt: new Date()
    });
    return Array.from(this.activeUsers.values());
  }

  // Remove a user from the document's active users
  removeUser(userId) {
    this.activeUsers.delete(userId);
    return Array.from(this.activeUsers.values());
  }

  // Get all active users for this document
  getActiveUsers() {
    return Array.from(this.activeUsers.values());
  }

  // Get the document state (for sending to clients)
  getState() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      version: this.version,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      activeUsers: this.getActiveUsers()
    };
  }
}

module.exports = Document;
