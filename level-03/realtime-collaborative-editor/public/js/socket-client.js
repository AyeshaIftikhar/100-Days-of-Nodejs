/**
 * Socket Client
 * Handles communication with the server using Socket.IO
 */
class SocketClient {
    constructor() {
        this.socket = io();
        this.documentId = null;
        this.user = null;
        this.activeUsers = [];
        this.callbacks = {
            documentLoaded: null,
            textChanged: null,
            selectionChanged: null,
            userJoined: null,
            userLeft: null,
            titleUpdated: null
        };

        this.initSocketEvents();
    }

    /**
     * Initialize socket event listeners
     */
    initSocketEvents() {
        // Handle text changes from other clients
        this.socket.on('text-change', (data) => {
            const { change, userId, version } = data;
            if (this.callbacks.textChanged) {
                this.callbacks.textChanged(change, userId, version);
            }
        });

        // Handle change errors
        this.socket.on('change-error', (data) => {
            const { error, version } = data;
            console.error('Change error:', error);
            window.ui.showToast(`Error: ${error}`, 'error');
        });

        // Handle selection changes from other clients
        this.socket.on('selection-change', (data) => {
            const { userId, selection } = data;
            if (this.callbacks.selectionChanged) {
                this.callbacks.selectionChanged(userId, selection);
            }
        });

        // Handle new user joining
        this.socket.on('user-joined', (data) => {
            const { user, users } = data;
            this.activeUsers = users;
            
            window.ui.showToast(`${user.username} joined the document`, 'info');
            window.ui.renderActiveUsers(users, this.user?.userId);
            
            if (this.callbacks.userJoined) {
                this.callbacks.userJoined(user, users);
            }
        });

        // Handle user leaving
        this.socket.on('user-left', (data) => {
            const { userId, users } = data;
            this.activeUsers = users;
            
            // Find the username of the user who left
            const leftUser = this.activeUsers.find(u => u.userId === userId);
            if (leftUser) {
                window.ui.showToast(`${leftUser.username} left the document`, 'info');
            }
            
            window.ui.renderActiveUsers(users, this.user?.userId);
            
            if (this.callbacks.userLeft) {
                this.callbacks.userLeft(userId, users);
            }
        });

        // Handle document title updates
        this.socket.on('title-updated', (data) => {
            const { title, userId } = data;
            window.ui.updateDocumentTitle(title);
            
            if (this.callbacks.titleUpdated) {
                this.callbacks.titleUpdated(title, userId);
            }
        });
    }

    /**
     * Join a document editing session
     */
    joinDocument(documentId) {
        return new Promise((resolve, reject) => {
            this.socket.emit('join-document', documentId, (response) => {
                if (response.error) {
                    reject(response.error);
                    return;
                }
                
                this.documentId = documentId;
                this.user = response.user;
                this.activeUsers = response.users;
                
                window.ui.updateDocumentTitle(response.document.title);
                window.ui.renderActiveUsers(response.users, this.user.userId);
                
                if (this.callbacks.documentLoaded) {
                    this.callbacks.documentLoaded(response.document);
                }
                
                resolve(response);
            });
        });
    }

    /**
     * Leave the current document
     */
    leaveDocument() {
        if (this.documentId) {
            this.socket.emit('leave-document');
            this.documentId = null;
        }
    }

    /**
     * Send a text change to the server
     */
    sendTextChange(change, version) {
        this.socket.emit('text-change', {
            change,
            version
        });
    }

    /**
     * Send cursor/selection change to the server
     */
    sendSelection(selection) {
        this.socket.emit('selection-change', selection);
    }

    /**
     * Update document title
     */
    updateDocumentTitle(title) {
        this.socket.emit('update-title', title);
    }

    /**
     * Register a callback for when the document is loaded
     */
    onDocumentLoaded(callback) {
        this.callbacks.documentLoaded = callback;
    }

    /**
     * Register a callback for when a text change is received
     */
    onTextChanged(callback) {
        this.callbacks.textChanged = callback;
    }

    /**
     * Register a callback for when a selection change is received
     */
    onSelectionChanged(callback) {
        this.callbacks.selectionChanged = callback;
    }

    /**
     * Register a callback for when a user joins
     */
    onUserJoined(callback) {
        this.callbacks.userJoined = callback;
    }

    /**
     * Register a callback for when a user leaves
     */
    onUserLeft(callback) {
        this.callbacks.userLeft = callback;
    }

    /**
     * Register a callback for when the title is updated
     */
    onTitleUpdated(callback) {
        this.callbacks.titleUpdated = callback;
    }
}

// Initialize socket client
window.socketClient = new SocketClient();
