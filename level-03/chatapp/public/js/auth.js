// Authentication handling

// DOM elements
const authContainer = document.getElementById('auth-container');
const chatContainer = document.getElementById('chat-container');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.form-container');

// Authentication state
let currentUser = null;
let authToken = null;

// Check if user is already logged in
const checkAuth = () => {
  const token = localStorage.getItem('token');
  if (token) {
    // Validate token with server
    fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Set auth state
        authToken = token;
        currentUser = data.user;
        
        // Show chat UI
        showChatUI();
      } else {
        // Token invalid, clear storage
        localStorage.removeItem('token');
        showAuthUI();
      }
    })
    .catch(error => {
      console.error('Auth check error:', error);
      localStorage.removeItem('token');
      showAuthUI();
    });
  } else {
    showAuthUI();
  }
};

// Show authentication UI
const showAuthUI = () => {
  authContainer.classList.remove('hidden');
  chatContainer.classList.add('hidden');
};

// Show chat UI
const showChatUI = () => {
  // Update UI elements with user data
  document.getElementById('username').textContent = currentUser.username;
  document.getElementById('user-avatar').style.backgroundImage = `url(${currentUser.avatar})`;
  document.getElementById('status-select').value = currentUser.status;
  
  // Switch containers
  authContainer.classList.add('hidden');
  chatContainer.classList.remove('hidden');
  
  // Initialize chat functionality
  initializeChat();
};

// Login handler
const handleLogin = (e) => {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  // Validate input
  if (!email || !password) {
    alert('Please fill in all fields');
    return;
  }
  
  // Send login request
  fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Set auth state
      authToken = data.token;
      currentUser = data.user;
      
      // Save token
      localStorage.setItem('token', data.token);
      
      // Show chat UI
      showChatUI();
    } else {
      alert(data.message || 'Login failed');
    }
  })
  .catch(error => {
    console.error('Login error:', error);
    alert('Login failed. Please try again.');
  });
};

// Register handler
const handleRegister = (e) => {
  e.preventDefault();
  
  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirmPassword').value;
  
  // Validate input
  if (!username || !email || !password || !confirmPassword) {
    alert('Please fill in all fields');
    return;
  }
  
  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }
  
  // Send register request
  fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, email, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Set auth state
      authToken = data.token;
      currentUser = data.user;
      
      // Save token
      localStorage.setItem('token', data.token);
      
      // Show chat UI
      showChatUI();
    } else {
      alert(data.message || 'Registration failed');
    }
  })
  .catch(error => {
    console.error('Register error:', error);
    alert('Registration failed. Please try again.');
  });
};

// Logout handler
const handleLogout = () => {
  // Send logout request
  fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  })
  .then(response => response.json())
  .then(data => {
    // Clear auth state
    authToken = null;
    currentUser = null;
    
    // Clear storage
    localStorage.removeItem('token');
    
    // Show auth UI
    showAuthUI();
    
    // Disconnect socket
    if (socket) {
      socket.disconnect();
    }
  })
  .catch(error => {
    console.error('Logout error:', error);
    alert('Logout failed. Please try again.');
  });
};

// Tab switching
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Update active tab
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Show corresponding form
    const tabId = tab.dataset.tab;
    tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabId}-form`).classList.add('active');
  });
});

// Initialize auth
const initAuth = () => {
  // Set up event listeners
  loginForm.addEventListener('submit', handleLogin);
  registerForm.addEventListener('submit', handleRegister);
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  
  // Check authentication status
  checkAuth();
};

// Export functions
window.Auth = {
  checkAuth,
  currentUser: () => currentUser,
  token: () => authToken,
  logout: handleLogout
};
