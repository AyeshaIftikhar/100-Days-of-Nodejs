/**
 * Editor Controller
 * Handles the text editor functionality using CodeMirror
 */
class EditorController {
    constructor() {
        // Initialize properties
        this.editor = null;
        this.documentId = null;
        this.version = 0;
        this.content = '';
        this.remoteCursors = new Map();
        this.lastSentContent = '';
        this.ignoreChanges = false;
        
        // Initialize editor
        this.initEditor();
        
        // Initialize socket client callbacks
        this.initSocketCallbacks();
        
        // Parse URL for document ID
        this.parseUrl();
        
        // Load documents for sidebar
        this.loadDocumentList();
    }
    
    /**
     * Initialize CodeMirror editor
     */
    initEditor() {
        this.editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
            lineNumbers: true,
            mode: 'text/plain',
            theme: 'default',
            lineWrapping: true,
            autofocus: true
        });
        
        // Handle editor changes
        this.editor.on('changes', (editor) => {
            if (this.ignoreChanges || !this.documentId) return;
            
            // Get the new content
            const newContent = editor.getValue();
            
            // Avoid sending the same content
            if (newContent === this.lastSentContent) return;
            
            // Update the content
            this.content = newContent;
            this.lastSentContent = newContent;
            
            // Send the change
            window.socketClient.sendTextChange({
                text: newContent
            }, this.version);
        });
        
        // Handle cursor/selection changes
        this.editor.on('cursorActivity', () => {
            if (!this.documentId || !window.socketClient) return;
            
            const selection = this.editor.getDoc().listSelections()[0];
            if (selection) {
                window.socketClient.sendSelection({
                    anchor: this.posToIndex(selection.anchor),
                    head: this.posToIndex(selection.head)
                });
            }
        });
    }
    
    /**
     * Initialize socket client callbacks
     */
    initSocketCallbacks() {
        window.socketClient.onDocumentLoaded(this.handleDocumentLoaded.bind(this));
        window.socketClient.onTextChanged(this.handleTextChanged.bind(this));
        window.socketClient.onSelectionChanged(this.handleSelectionChanged.bind(this));
        window.socketClient.onUserLeft(this.handleUserLeft.bind(this));
    }
    
    /**
     * Parse URL for document ID
     */
    parseUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const docId = urlParams.get('doc');
        
        if (docId) {
            this.documentId = docId;
            window.currentDocumentId = docId;
            this.joinDocument(docId);
        }
    }
    
    /**
     * Join a document
     */
    async joinDocument(documentId) {
        try {
            await window.socketClient.joinDocument(documentId);
        } catch (error) {
            console.error('Error joining document:', error);
            window.ui.showToast(`Failed to join document: ${error}`, 'error');
        }
    }
    
    /**
     * Handle document loaded
     */
    handleDocumentLoaded(document) {
        this.documentId = document.id;
        this.version = document.version;
        this.content = document.content;
        this.lastSentContent = document.content;
        
        // Initialize the editor with document content
        this.ignoreChanges = true;
        this.editor.setValue(document.content);
        this.ignoreChanges = false;
    }
    
    /**
     * Handle received text change from server
     */
    handleTextChanged(change, userId, version) {
        if (userId === window.socketClient.user.userId) return;
        
        // Apply the change
        if (change.text !== undefined) {
            this.ignoreChanges = true;
            this.editor.setValue(change.text);
            this.ignoreChanges = false;
            this.content = change.text;
            this.lastSentContent = change.text;
        }
        
        this.version = version;
    }
    
    /**
     * Handle selection change from other user
     */
    handleSelectionChanged(userId, selection) {
        if (userId === window.socketClient.user.userId) return;
        
        // Find the user data
        const userData = window.socketClient.activeUsers.find(u => u.userId === userId);
        if (!userData) return;
        
        // Remove previous cursor for this user
        this.removeRemoteCursor(userId);
        
        // Create new cursor element
        const cursorElement = document.createElement('div');
        cursorElement.className = 'remote-cursor';
        cursorElement.style.borderColor = userData.color;
        cursorElement.style.backgroundColor = userData.color;
        cursorElement.setAttribute('data-username', userData.username);
        
        // Convert selection indices to CodeMirror positions
        const anchor = this.indexToPos(selection.anchor);
        const head = this.indexToPos(selection.head);
        
        // Add cursor to editor
        const cursorBookmark = this.editor.setBookmark(anchor, {
            widget: cursorElement
        });
        
        // Store cursor data
        this.remoteCursors.set(userId, {
            bookmark: cursorBookmark,
            color: userData.color
        });
    }
    
    /**
     * Handle user left event
     */
    handleUserLeft(userId) {
        this.removeRemoteCursor(userId);
    }
    
    /**
     * Remove remote cursor for a user
     */
    removeRemoteCursor(userId) {
        const cursorData = this.remoteCursors.get(userId);
        if (cursorData) {
            cursorData.bookmark.clear();
            this.remoteCursors.delete(userId);
        }
    }
    
    /**
     * Convert position to index
     */
    posToIndex(pos) {
        const doc = this.editor.getDoc();
        let index = 0;
        
        for (let i = 0; i < pos.line; i++) {
            index += doc.getLine(i).length + 1; // +1 for newline
        }
        
        index += pos.ch;
        return index;
    }
    
    /**
     * Convert index to position
     */
    indexToPos(index) {
        const doc = this.editor.getDoc();
        let line = 0;
        let ch = 0;
        
        let remainingIndex = index;
        
        while (line < doc.lineCount()) {
            const lineLength = doc.getLine(line).length + 1; // +1 for newline
            
            if (remainingIndex < lineLength) {
                ch = remainingIndex;
                break;
            }
            
            remainingIndex -= lineLength;
            line++;
        }
        
        return { line, ch };
    }
    
    /**
     * Load document list for sidebar
     */
    loadDocumentList() {
        fetch('/documents')
            .then(response => response.json())
            .then(documents => {
                window.ui.renderDocumentList(documents, this.documentId);
            })
            .catch(error => {
                console.error('Error loading documents:', error);
            });
    }
}

// Initialize editor when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.editorController = new EditorController();
});
