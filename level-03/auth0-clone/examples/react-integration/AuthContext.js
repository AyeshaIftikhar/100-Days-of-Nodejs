import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

// Create authentication context
const AuthContext = createContext();

// Token refresh settings
const REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutes (assuming 15-minute token)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTimer, setRefreshTimer] = useState(null);

  // Setup axios interceptor for handling 401 responses
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        
        // If error is 401 and not a retry and not from auth endpoints
        if (
          error.response?.status === 401 && 
          !originalRequest._retry &&
          !originalRequest.url.includes('/auth/')
        ) {
          originalRequest._retry = true;
          
          try {
            // Attempt to refresh the token
            const refreshed = await refreshToken();
            
            if (refreshed) {
              // Update the Authorization header and retry
              originalRequest.headers.Authorization = `Bearer ${localStorage.getItem('accessToken')}`;
              return axios(originalRequest);
            }
          } catch (err) {
            console.error('Token refresh failed:', err);
            // Force logout on refresh failure
            logout();
          }
        }
        
        return Promise.reject(error);
      }
    );
    
    return () => {
      // Clean up the interceptor when component unmounts
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const initialize = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        try {
          // Fetch user profile
          await fetchUserProfile();
          
          // Setup token refresh
          setupTokenRefresh();
        } catch (err) {
          console.error('Initialization error:', err);
          logout();
        }
      }
      
      setLoading(false);
    };
    
    initialize();
    
    // Cleanup on unmount
    return () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, []);

  // Fetch user profile using stored token
  const fetchUserProfile = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('No token available');
    }
    
    const response = await axios.get(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    setUser(response.data.data);
  }, []);

  // Setup token refresh interval
  const setupTokenRefresh = useCallback(() => {
    // Clear any existing timer
    if (refreshTimer) {
      clearInterval(refreshTimer);
    }
    
    // Set up a new timer
    const timer = setInterval(async () => {
      try {
        await refreshToken();
      } catch (err) {
        console.error('Token refresh error:', err);
        clearInterval(timer);
        logout();
      }
    }, REFRESH_INTERVAL);
    
    setRefreshTimer(timer);
  }, [refreshTimer]);

  // Refresh the access token
  const refreshToken = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/refresh-token`,
        {},
        { withCredentials: true } // Send cookies
      );
      
      if (response.data.success && response.data.data.accessToken) {
        localStorage.setItem('accessToken', response.data.data.accessToken);
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Token refresh failed:', err);
      return false;
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setError(null);
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      
      const { accessToken, user } = response.data.data;
      
      // Store token and user data
      localStorage.setItem('accessToken', accessToken);
      setUser(user);
      
      // Setup token refresh
      setupTokenRefresh();
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  // Register new user
  const register = async (userData) => {
    try {
      setError(null);
      
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      return {
        success: true,
        data: response.data
      };
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      
      return {
        success: false,
        error: err.response?.data || err.message
      };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        // Notify server about logout
        await axios.post(
          `${API_URL}/auth/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true // Send cookies
          }
        );
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear token and user data regardless of server response
      localStorage.removeItem('accessToken');
      setUser(null);
      
      // Clear token refresh timer
      if (refreshTimer) {
        clearInterval(refreshTimer);
        setRefreshTimer(null);
      }
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.put(
        `${API_URL}/users/me`,
        profileData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Update local user data
      setUser(response.data.data);
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed');
      
      return {
        success: false,
        error: err.response?.data || err.message
      };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.post(
        `${API_URL}/users/me/change-password`,
        {
          currentPassword,
          newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      return {
        success: true,
        data: response.data
      };
    } catch (err) {
      setError(err.response?.data?.message || 'Password change failed');
      
      return {
        success: false,
        error: err.response?.data || err.message
      };
    }
  };

  // Request password reset
  const requestPasswordReset = async (email) => {
    try {
      setError(null);
      
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        email
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset request failed');
      
      return {
        success: false,
        error: err.response?.data || err.message
      };
    }
  };

  // Reset password with token
  const resetPassword = async (token, newPassword) => {
    try {
      setError(null);
      
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        newPassword
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
      
      return {
        success: false,
        error: err.response?.data || err.message
      };
    }
  };

  // Initiate social login
  const socialLogin = (provider) => {
    window.location.href = `${API_URL}/social/${provider}`;
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    socialLogin,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
