// Auth utilities for frontend

// API URL (would normally come from environment)
const API_URL = 'http://localhost:3000/api';

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('accessToken');
};

// Set token in localStorage
const setToken = (token) => {
  localStorage.setItem('accessToken', token);
};

// Set user in localStorage
const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Get user from localStorage
const getUser = () => {
  const userJson = localStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
};

// Clear auth data on logout
const clearAuth = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
};

// Check if user is authenticated
const isAuthenticated = () => {
  return !!getToken();
};

// Fetch with auth headers
const authFetch = async (url, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  // Handle unauthorized responses (token expired)
  if (response.status === 401) {
    // Try to refresh token
    try {
      const refreshed = await refreshToken();
      if (refreshed) {
        // Retry the original request with new token
        return authFetch(url, options);
      } else {
        // Redirect to login if refresh failed
        logout();
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      window.location.href = '/login';
    }
  }
  
  return response;
};

// Register new user
const register = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  
  return response.json();
};

// Login user
const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (response.ok && data.success) {
    setToken(data.data.accessToken);
    setUser(data.data.user);
  }
  
  return data;
};

// Logout user
const logout = async () => {
  if (!getToken()) return;
  
  try {
    await authFetch(`${API_URL}/auth/logout`, {
      method: 'POST'
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearAuth();
  }
};

// Refresh token
const refreshToken = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Include cookies
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      setToken(data.data.accessToken);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Token refresh error:', error);
    return false;
  }
};

// Get user profile
const getUserProfile = async () => {
  const response = await authFetch(`${API_URL}/users/me`);
  return response.json();
};

// Update user profile
const updateUserProfile = async (profileData) => {
  const response = await authFetch(`${API_URL}/users/me`, {
    method: 'PUT',
    body: JSON.stringify(profileData)
  });
  
  return response.json();
};

// Change password
const changePassword = async (currentPassword, newPassword) => {
  const response = await authFetch(`${API_URL}/users/me/change-password`, {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword })
  });
  
  return response.json();
};

// Initiate social login
const socialLogin = (provider) => {
  window.location.href = `${API_URL}/social/${provider}`;
};

// Update UI based on auth state
const updateAuthUI = () => {
  const isLoggedIn = isAuthenticated();
  
  // Get UI elements
  const loginLink = document.getElementById('loginLink');
  const signupLink = document.getElementById('signupLink');
  const profileLink = document.getElementById('profileLink');
  const logoutLink = document.getElementById('logoutLink');
  
  if (isLoggedIn) {
    // User is logged in
    if (loginLink) loginLink.style.display = 'none';
    if (signupLink) signupLink.style.display = 'none';
    if (profileLink) profileLink.style.display = 'block';
    if (logoutLink) {
      logoutLink.style.display = 'block';
      logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        logout().then(() => {
          window.location.href = '/';
        });
      });
    }
  } else {
    // User is logged out
    if (loginLink) loginLink.style.display = 'block';
    if (signupLink) signupLink.style.display = 'block';
    if (profileLink) profileLink.style.display = 'none';
    if (logoutLink) logoutLink.style.display = 'none';
    
    // Redirect to login if trying to access profile page
    if (window.location.pathname === '/profile') {
      window.location.href = '/login';
    }
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', updateAuthUI);
