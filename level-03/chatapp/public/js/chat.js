// Chat functionality

// DOM elements
const roomsList = document.getElementById('rooms-list');
const usersList = document.getElementById('users-list');
const welcomeScreen = document.getElementById('welcome-screen');
const roomChat = document.getElementById('room-chat');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message-btn');
const currentRoomName = document.getElementById('current-room-name');
const currentRoomParticipants = document.getElementById('current-room-participants');
const statusSelect = document.getElementById('status-select');
const createRoomBtn = document.getElementById('create-room-btn');
const createRoomModal = document.getElementById('create-room-modal');
const createRoomForm = document.getElementById('create-room-form');
const closeModalBtns = document.querySelectorAll('.close-modal');
const addParticipantsBtn = document.getElementById('add-participants-btn');
const addParticipantsModal = document.getElementById('add-participants-modal');
const addSelectedParticipantsBtn = document.getElementById('add-selected-participants');
const leaveRoomBtn = document.getElementById('leave-room-btn');

// Chat state
let socket = null;
let currentRoom = null;
let rooms = [];
let users = [];
let typing = false;
let typingTimeout = null;

// Initialize socket connection
const initSocket = () => {
  // Connect to socket server with auth token
  socket = io({
    auth: {
      token: Auth.token()
    }
  });
  
  // Socket event handlers
  socket.on('connected', (data) => {
    console.log('Connected to chat server:', data.message);
    
    // Fetch rooms and users
    fetchRooms();
    fetchUsers();
  });
  
  socket.on('error', (data) => {
    console.error('Socket error:', data.message);
    alert(`Socket error: ${data.message}`);
  });
  
  socket.on('newMessage', (message) => {
    // Only add message if in the right room
    if (currentRoom && message.room === currentRoom.id) {
      addMessageToUI(message);
      
      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  });
  
  socket.on('userStatusChanged', (data) => {
    // Update user in list
    updateUserStatus(data.userId, data.status);
  });
  
  socket.on('userJoined', (data) => {
    if (currentRoom && data.roomId === currentRoom.id) {
      // Add system message
      const systemMessage = {
        id: Date.now(),
        room: currentRoom.id,
        sender: null,
        content: `${data.user.username} joined the room`,
        messageType: 'system',
        createdAt: new Date().toISOString()
      };
      addMessageToUI(systemMessage);
    }
  });
  
  socket.on('userLeft', (data) => {
    if (currentRoom && data.roomId === currentRoom.id) {
      // Add system message
      const systemMessage = {
        id: Date.now(),
        room: currentRoom.id,
        sender: null,
        content: `${data.user.username} left the room`,
        messageType: 'system',
        createdAt: new Date().toISOString()
      };
      addMessageToUI(systemMessage);
    }
  });
  
  socket.on('userTyping', (data) => {
    if (currentRoom && data.roomId === currentRoom.id) {
      // Show typing indicator
      showTypingIndicator(data.user.username);
    }
  });
  
  socket.on('userStoppedTyping', (data) => {
    if (currentRoom && data.roomId === currentRoom.id) {
      // Hide typing indicator
      hideTypingIndicator();
    }
  });
  
  // WebRTC related events handled in webrtc.js
  
  // Reconnect handling
  socket.on('disconnect', () => {
    console.log('Disconnected from chat server');
  });
  
  socket.on('reconnect', () => {
    console.log('Reconnected to chat server');
    
    // Re-fetch data
    fetchRooms();
    fetchUsers();
    
    // Rejoin current room if any
    if (currentRoom) {
      joinRoom(currentRoom.id);
    }
  });
};

// Fetch all rooms
const fetchRooms = () => {
  fetch('/api/rooms', {
    headers: {
      'Authorization': `Bearer ${Auth.token()}`
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      rooms = data.rooms;
      updateRoomsList();
    }
  })
  .catch(error => {
    console.error('Fetch rooms error:', error);
  });
};

// Fetch all users
const fetchUsers = () => {
  fetch('/api/users', {
    headers: {
      'Authorization': `Bearer ${Auth.token()}`
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      users = data.users;
      updateUsersList();
    }
  })
  .catch(error => {
    console.error('Fetch users error:', error);
  });
};

// Update rooms list in UI
const updateRoomsList = () => {
  roomsList.innerHTML = '';
  
  rooms.forEach(room => {
    const li = document.createElement('li');
    li.dataset.id = room.id;
    
    if (currentRoom && room.id === currentRoom.id) {
      li.classList.add('active');
    }
    
    // Add room type icon
    const iconClass = room.type === 'public' ? 'fa-users' : 'fa-lock';
    
    li.innerHTML = `
      <i class="fas ${iconClass} room-type-icon"></i>
      <span>${room.name}</span>
    `;
    
    li.addEventListener('click', () => {
      selectRoom(room);
    });
    
    roomsList.appendChild(li);
  });
};

// Update users list in UI
const updateUsersList = () => {
  usersList.innerHTML = '';
  
  users.forEach(user => {
    // Skip current user
    if (user.id === Auth.currentUser().id) return;
    
    const li = document.createElement('li');
    li.dataset.id = user.id;
    
    const statusClass = `status-${user.status}`;
    
    li.innerHTML = `
      <div class="user-status ${statusClass}"></div>
      <span>${user.username}</span>
    `;
    
    li.addEventListener('click', () => {
      createDirectMessageRoom(user);
    });
    
    usersList.appendChild(li);
  });
};

// Update user status in list
const updateUserStatus = (userId, status) => {
  // Update in users array
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex].status = status;
  }
  
  // Update in UI
  const userElement = usersList.querySelector(`li[data-id="${userId}"]`);
  if (userElement) {
    const statusElement = userElement.querySelector('.user-status');
    statusElement.className = `user-status status-${status}`;
  }
};

// Select a room
const selectRoom = (room) => {
  // Update current room
  currentRoom = room;
  
  // Update UI
  updateRoomsList();
  currentRoomName.textContent = room.name;
  currentRoomParticipants.textContent = `${room.participants.length} participants`;
  
  // Clear messages
  messagesContainer.innerHTML = '';
  
  // Show room chat
  welcomeScreen.classList.add('hidden');
  roomChat.classList.remove('hidden');
  
  // Join room in socket
  socket.emit('joinRoom', { roomId: room.id });
  
  // Fetch messages
  fetchRoomMessages(room.id);
};

// Fetch messages for a room
const fetchRoomMessages = (roomId) => {
  fetch(`/api/rooms/${roomId}/messages`, {
    headers: {
      'Authorization': `Bearer ${Auth.token()}`
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Clear existing messages
      messagesContainer.innerHTML = '';
      
      // Add messages in reverse order (oldest first)
      data.messages.reverse().forEach(message => {
        addMessageToUI(message);
      });
      
      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  })
  .catch(error => {
    console.error('Fetch messages error:', error);
  });
};

// Add message to UI
const addMessageToUI = (message) => {
  const messageElement = document.createElement('div');
  const currentUserId = Auth.currentUser().id;
  
  // Determine message type
  if (message.messageType === 'system') {
    messageElement.className = 'message system';
    messageElement.innerHTML = `
      <div class="message-content">
        ${message.content}
      </div>
    `;
  } else {
    // Check if message is from current user
    const isOutgoing = message.sender.id === currentUserId;
    messageElement.className = `message ${isOutgoing ? 'outgoing' : 'incoming'}`;
    
    // Format timestamp
    const messageTime = new Date(message.createdAt).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    messageElement.innerHTML = `
      <div class="message-content">
        ${!isOutgoing ? `<div class="message-sender">${message.sender.username}</div>` : ''}
        <div class="message-text">${message.content}</div>
        <div class="message-time">${messageTime}</div>
      </div>
    `;
  }
  
  messagesContainer.appendChild(messageElement);
};

// Send message
const sendMessage = () => {
  const content = messageInput.value.trim();
  
  if (!content || !currentRoom) return;
  
  // Clear input
  messageInput.value = '';
  
  // Send to server
  socket.emit('sendMessage', {
    roomId: currentRoom.id,
    content,
    messageType: 'text'
  });
  
  // Reset typing status
  if (typing) {
    typing = false;
    socket.emit('stopTyping', { roomId: currentRoom.id });
  }
};

// Show typing indicator
const showTypingIndicator = (username) => {
  // Check if indicator already exists
  const existingIndicator = document.getElementById('typing-indicator');
  if (existingIndicator) {
    return;
  }
  
  const indicator = document.createElement('div');
  indicator.id = 'typing-indicator';
  indicator.className = 'message system';
  indicator.innerHTML = `
    <div class="message-content">
      ${username} is typing...
    </div>
  `;
  
  messagesContainer.appendChild(indicator);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

// Hide typing indicator
const hideTypingIndicator = () => {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) {
    indicator.remove();
  }
};

// Create a new room
const createRoom = (e) => {
  e.preventDefault();
  
  const name = document.getElementById('room-name').value;
  const description = document.getElementById('room-description').value;
  const type = document.getElementById('room-type').value;
  
  // Get selected participants
  const selectedParticipants = [];
  document.querySelectorAll('#participants-list input:checked').forEach(checkbox => {
    selectedParticipants.push(checkbox.value);
  });
  
  // Create room
  fetch('/api/rooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Auth.token()}`
    },
    body: JSON.stringify({
      name,
      description,
      type,
      participants: selectedParticipants
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Add room to list
      rooms.push(data.room);
      updateRoomsList();
      
      // Select the new room
      selectRoom(data.room);
      
      // Close modal
      createRoomModal.classList.remove('active');
      
      // Reset form
      createRoomForm.reset();
    } else {
      alert(data.message || 'Failed to create room');
    }
  })
  .catch(error => {
    console.error('Create room error:', error);
    alert('Failed to create room');
  });
};

// Create a direct message room
const createDirectMessageRoom = (targetUser) => {
  // Check if direct room already exists
  const existingRoom = rooms.find(room => {
    return room.type === 'direct' && 
           room.participants.length === 2 && 
           room.participants.some(p => p.id === targetUser.id);
  });
  
  if (existingRoom) {
    // Select existing room
    selectRoom(existingRoom);
    return;
  }
  
  // Create new direct message room
  fetch('/api/rooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Auth.token()}`
    },
    body: JSON.stringify({
      name: `Chat with ${targetUser.username}`,
      type: 'direct',
      participants: [targetUser.id]
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Add room to list
      rooms.push(data.room);
      updateRoomsList();
      
      // Select the new room
      selectRoom(data.room);
    } else {
      alert(data.message || 'Failed to create direct message');
    }
  })
  .catch(error => {
    console.error('Create direct message error:', error);
    alert('Failed to create direct message');
  });
};

// Add participants to room
const addParticipants = () => {
  if (!currentRoom) return;
  
  // Get selected participants
  const selectedParticipants = [];
  document.querySelectorAll('#available-participants input:checked').forEach(checkbox => {
    selectedParticipants.push(checkbox.value);
  });
  
  if (selectedParticipants.length === 0) {
    alert('Please select at least one user');
    return;
  }
  
  // Add participants
  fetch(`/api/rooms/${currentRoom.id}/participants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Auth.token()}`
    },
    body: JSON.stringify({
      participants: selectedParticipants
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Update room
      const roomIndex = rooms.findIndex(r => r.id === currentRoom.id);
      if (roomIndex !== -1) {
        rooms[roomIndex] = data.room;
      }
      
      // Update current room
      currentRoom = data.room;
      
      // Update UI
      currentRoomParticipants.textContent = `${currentRoom.participants.length} participants`;
      
      // Close modal
      addParticipantsModal.classList.remove('active');
    } else {
      alert(data.message || 'Failed to add participants');
    }
  })
  .catch(error => {
    console.error('Add participants error:', error);
    alert('Failed to add participants');
  });
};

// Leave current room
const leaveRoom = () => {
  if (!currentRoom) return;
  
  if (!confirm('Are you sure you want to leave this room?')) {
    return;
  }
  
  fetch(`/api/rooms/${currentRoom.id}/leave`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${Auth.token()}`
    }
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Remove room from list
      const roomIndex = rooms.findIndex(r => r.id === currentRoom.id);
      if (roomIndex !== -1) {
        rooms.splice(roomIndex, 1);
      }
      
      // Update UI
      updateRoomsList();
      
      // Show welcome screen
      currentRoom = null;
      welcomeScreen.classList.remove('hidden');
      roomChat.classList.add('hidden');
    } else {
      alert(data.message || 'Failed to leave room');
    }
  })
  .catch(error => {
    console.error('Leave room error:', error);
    alert('Failed to leave room');
  });
};

// Populate participants list in create room modal
const populateParticipantsList = () => {
  const participantsList = document.getElementById('participants-list');
  participantsList.innerHTML = '';
  
  users.forEach(user => {
    // Skip current user
    if (user.id === Auth.currentUser().id) return;
    
    const item = document.createElement('div');
    item.className = 'participant-item';
    
    item.innerHTML = `
      <input type="checkbox" class="participant-checkbox" id="participant-${user.id}" value="${user.id}">
      <label for="participant-${user.id}">${user.username}</label>
    `;
    
    participantsList.appendChild(item);
  });
};

// Populate available participants for adding to room
const populateAvailableParticipants = () => {
  const availableParticipants = document.getElementById('available-participants');
  availableParticipants.innerHTML = '';
  
  // Get current participants ids
  const currentParticipantIds = currentRoom.participants.map(p => p.id);
  
  users.forEach(user => {
    // Skip current user and users already in the room
    if (user.id === Auth.currentUser().id || currentParticipantIds.includes(user.id)) return;
    
    const item = document.createElement('div');
    item.className = 'participant-item';
    
    item.innerHTML = `
      <input type="checkbox" class="participant-checkbox" id="available-${user.id}" value="${user.id}">
      <label for="available-${user.id}">${user.username}</label>
    `;
    
    availableParticipants.appendChild(item);
  });
};

// Handle status change
const handleStatusChange = () => {
  const newStatus = statusSelect.value;
  
  // Update in socket
  socket.emit('changeStatus', { status: newStatus });
};

// Initialize chat
const initializeChat = () => {
  // Initialize socket
  initSocket();
  
  // Set up event listeners
  sendMessageBtn.addEventListener('click', sendMessage);
  
  messageInput.addEventListener('keypress', (e) => {
    // Send on Enter
    if (e.key === 'Enter') {
      sendMessage();
    }
    
    // Emit typing status
    if (currentRoom && !typing) {
      typing = true;
      socket.emit('typing', { roomId: currentRoom.id });
      
      // Clear previous timeout
      if (typingTimeout) clearTimeout(typingTimeout);
      
      // Set timeout to stop typing indicator
      typingTimeout = setTimeout(() => {
        typing = false;
        socket.emit('stopTyping', { roomId: currentRoom.id });
      }, 3000);
    }
  });
  
  statusSelect.addEventListener('change', handleStatusChange);
  
  createRoomBtn.addEventListener('click', () => {
    populateParticipantsList();
    createRoomModal.classList.add('active');
  });
  
  addParticipantsBtn.addEventListener('click', () => {
    populateAvailableParticipants();
    addParticipantsModal.classList.add('active');
  });
  
  createRoomForm.addEventListener('submit', createRoom);
  
  addSelectedParticipantsBtn.addEventListener('click', addParticipants);
  
  leaveRoomBtn.addEventListener('click', leaveRoom);
  
  // Close modals on X click
  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
      });
    });
  });
  
  // Close modals on outside click
  window.addEventListener('click', (e) => {
    document.querySelectorAll('.modal').forEach(modal => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
};

// Export functions
window.Chat = {
  initialize: initializeChat,
  getCurrentRoom: () => currentRoom
};
