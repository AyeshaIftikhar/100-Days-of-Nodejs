import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Login component for handling user authentication
 */
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error, isAuthenticated } = useAuth();
  const location = useLocation();

  // Get the redirect path from location state, or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  // If already authenticated, redirect to the original destination
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await login(email, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (provider) => {
    const { socialLogin } = useAuth();
    socialLogin(provider);
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
          
          <a href="/forgot-password" className="forgot-password-link">
            Forgot Password?
          </a>
        </div>
      </form>
      
      <div className="social-login">
        <p>Or sign in with:</p>
        <div className="social-buttons">
          <button 
            onClick={() => handleSocialLogin('google')}
            className="btn-social google"
            disabled={isSubmitting}
          >
            Google
          </button>
          <button 
            onClick={() => handleSocialLogin('github')}
            className="btn-social github"
            disabled={isSubmitting}
          >
            GitHub
          </button>
        </div>
      </div>
      
      <div className="register-link">
        <p>
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
