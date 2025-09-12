/**
 * UI Controller
 * Handles UI interactions and DOM manipulations
 */
class UIController {
    constructor() {
        // DOM Elements
        this.documentTitleInput = document.getElementById('document-title');
        this.newDocBtn = document.getElementById('new-doc-btn');
        this.shareBtn = document.getElementById('share-btn');
        this.documentList = document.getElementById('document-list');
        this.activeUsersContainer = document.getElementById('active-users');
        this.shareModal = document.getElementById('share-modal');
        this.closeModalBtn = document.querySelector('.close');
        this.shareLink = document.getElementById('share-link');
        this.copyLinkBtn = document.getElementById('copy-link-btn');
        
        // Bind events
        this.initEventListeners();
    }
    
    /**
     * Initialize event listeners
     */
    initEventListeners() {
        // New document button
        this.newDocBtn.addEventListener('click', () => {
            this.createNewDocument();
        });
        
        // Share button
        this.shareBtn.addEventListener('click', () => {
            this.openShareModal();
        });
        
        // Close modal
        this.closeModalBtn.addEventListener('click', () => {
            this.closeShareModal();
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === this.shareModal) {
                this.closeShareModal();
            }
        });
        
        // Copy link button
        this.copyLinkBtn.addEventListener('click', () => {
            this.copyShareLink();
        });
        
        // Document title change
        this.documentTitleInput.addEventListener('blur', () => {
            if (window.socketClient && window.currentDocumentId) {
                window.socketClient.updateDocumentTitle(this.documentTitleInput.value);
            }
        });
        
        // Handle title keypress events
        this.documentTitleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.documentTitleInput.blur();
            }
        });
    }
    
    /**
     * Create a new document
     */
    createNewDocument() {
        fetch('/documents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: 'Untitled Document'
            })
        })
        .then(response => response.json())
        .then(document => {
            window.location.href = `/?doc=${document.id}`;
        })
        .catch(error => {
            console.error('Error creating document:', error);
            this.showToast('Failed to create document', 'error');
        });
    }
    
    /**
     * Open share modal
     */
    openShareModal() {
        if (window.currentDocumentId) {
            const shareUrl = `${window.location.origin}/?doc=${window.currentDocumentId}`;
            this.shareLink.value = shareUrl;
            this.shareModal.style.display = 'block';
        }
    }
    
    /**
     * Close share modal
     */
    closeShareModal() {
        this.shareModal.style.display = 'none';
    }
    
    /**
     * Copy share link to clipboard
     */
    copyShareLink() {
        this.shareLink.select();
        document.execCommand('copy');
        this.showToast('Link copied to clipboard!', 'success');
    }
    
    /**
     * Update document title in UI
     */
    updateDocumentTitle(title) {
        this.documentTitleInput.value = title;
        document.title = `${title} - Collaborative Editor`;
    }
    
    /**
     * Render document list
     */
    renderDocumentList(documents, currentDocumentId) {
        this.documentList.innerHTML = '';
        
        if (documents.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = 'No documents yet';
            emptyMessage.classList.add('empty-message');
            this.documentList.appendChild(emptyMessage);
            return;
        }
        
        documents.forEach(doc => {
            const listItem = document.createElement('li');
            listItem.textContent = doc.title;
            listItem.dataset.id = doc.id;
            
            if (doc.id === currentDocumentId) {
                listItem.classList.add('active');
            }
            
            listItem.addEventListener('click', () => {
                window.location.href = `/?doc=${doc.id}`;
            });
            
            this.documentList.appendChild(listItem);
        });
    }
    
    /**
     * Render active users
     */
    renderActiveUsers(users, currentUserId) {
        this.activeUsersContainer.innerHTML = '';
        
        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.classList.add('user-avatar');
            userElement.style.backgroundColor = user.color;
            userElement.dataset.userId = user.userId;
            
            // Use first letter of username
            userElement.textContent = user.username.charAt(0).toUpperCase();
            
            // Add title with full username
            userElement.title = user.username + (user.userId === currentUserId ? ' (You)' : '');
            
            this.activeUsersContainer.appendChild(userElement);
        });
    }
    
    /**
     * Show a toast notification
     */
    showToast(message, type = 'info') {
        // Remove existing toast if any
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create new toast
        const toast = document.createElement('div');
        toast.classList.add('toast');
        toast.textContent = message;
        
        // Add type class
        toast.classList.add(`toast-${type}`);
        
        // Add to DOM
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
}

// Initialize UI controller
window.ui = new UIController();
