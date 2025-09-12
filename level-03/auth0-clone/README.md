# Auth0 Clone

A comprehensive authentication and authorization service similar to Auth0, providing a robust solution for user management, authentication, and access control in your applications.

![Auth0 Clone Logo](logo.png)

## Features

- **User Authentication**: Secure login, registration, and password reset functionality
- **JWT Tokens**: Stateless authentication with JSON Web Tokens
- **Social Login**: Support for Google, GitHub, and other OAuth providers
- **Role-Based Access Control**: Fine-grained permission system for user authorization
- **Multi-tenancy**: Support for multiple organizations with isolated data
- **API Key Management**: Create and manage API keys for your applications
- **Email Verification**: Verify user emails to ensure account security
- **Password Policies**: Configurable password strength requirements
- **Refresh Tokens**: Seamless session management with token refresh
- **User Profile Management**: Update user information and preferences
- **Demo UI**: Simple frontend pages for testing and demonstration

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Integration Examples](#integration-examples)
- [Project Structure](#project-structure)
- [Security Considerations](#security-considerations)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/auth0-clone.git
cd auth0-clone
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory based on the `.env.example` file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration values.

## Configuration

Edit the `.env` file with your specific configuration:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/auth0-clone

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Frontend URLs
FRONTEND_URL=http://localhost:3000
REDIRECT_URL=http://localhost:3000/callback

# Security
BCRYPT_SALT_ROUNDS=10
```

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Access the application:
   - API: http://localhost:3000/api
   - Demo UI: http://localhost:3000

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and get tokens | No |
| POST | `/api/auth/refresh-token` | Refresh access token | No (uses refresh token) |
| POST | `/api/auth/logout` | Logout and invalidate tokens | Yes |
| POST | `/api/auth/logout-all` | Logout from all devices | Yes |
| POST | `/api/auth/verify-email` | Verify email address | No |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password with token | No |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/api/users/me` | Get current user profile | Yes |
| PUT | `/api/users/me` | Update user profile | Yes |
| POST | `/api/users/me/change-password` | Change password | Yes |
| GET | `/api/users/me/roles` | Get user roles | Yes |
| GET | `/api/users` | List users (admin) | Yes + Permission |
| GET | `/api/users/:userId` | Get user by ID (admin) | Yes + Permission |
| POST | `/api/users/:userId/roles` | Assign role to user (admin) | Yes + Permission |
| DELETE | `/api/users/:userId/roles/:roleId` | Remove role from user (admin) | Yes + Permission |

### Role Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/api/roles` | List roles | Yes + Permission |
| POST | `/api/roles` | Create a new role | Yes + Permission |
| GET | `/api/roles/:roleId` | Get role by ID | Yes + Permission |
| PUT | `/api/roles/:roleId` | Update role | Yes + Permission |
| DELETE | `/api/roles/:roleId` | Delete role | Yes + Permission |

### Tenant Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/api/tenants/current` | Get current tenant | No |
| GET | `/api/tenants` | List tenants | Yes + Permission |
| POST | `/api/tenants` | Create a new tenant | Yes + Permission |
| GET | `/api/tenants/:tenantId` | Get tenant by ID | Yes + Permission |
| PUT | `/api/tenants/:tenantId` | Update tenant | Yes + Permission |
| DELETE | `/api/tenants/:tenantId` | Delete tenant | Yes + Permission |
| POST | `/api/tenants/:tenantId/api-keys` | Generate API key | Yes + Permission |

### Social Login Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/api/social/google` | Initiate Google login | No |
| GET | `/api/social/google/callback` | Google OAuth callback | No |
| GET | `/api/social/github` | Initiate GitHub login | No |
| GET | `/api/social/github/callback` | GitHub OAuth callback | No |

## Integration Examples

### Express.js Integration

```javascript
// middleware/auth.js
const axios = require('axios');

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const response = await axios.post(
      'http://localhost:3000/api/auth/verify', 
      { token },
      { headers: { 'x-tenant-id': 'your-tenant-id' } }
    );
    
    req.user = response.data.user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { verifyToken };

// app.js
const express = require('express');
const { verifyToken } = require('./middleware/auth');
const app = express();

// Public route
app.get('/api/public', (req, res) => {
  res.json({ message: 'This is a public endpoint' });
});

// Protected route
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ 
    message: 'This is a protected endpoint', 
    user: req.user 
  });
});

app.listen(5000, () => console.log('Server running on port 5000'));
```

### React Integration

```javascript
// auth-context.js
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API_URL = 'http://localhost:3000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.data);
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { accessToken, user } = response.data.data;
      
      localStorage.setItem('accessToken', accessToken);
      setUser(user);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await axios.post(`${API_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      await axios.post(`${API_URL}/auth/register`, userData);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
```

## Project Structure

```
auth0-clone/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point
├── public/              # Static assets
│   ├── css/             # Stylesheets
│   └── js/              # Client-side scripts
├── views/               # EJS templates for demo UI
├── tests/               # Unit and integration tests
├── examples/            # Integration examples
├── .env.example         # Example environment variables
├── package.json         # Dependencies and scripts
└── README.md            # Project documentation
```

## Security Considerations

- **JWT Secret**: Use a strong, unique secret key for JWT signing
- **Password Storage**: Passwords are hashed using bcrypt
- **HTTPS**: Use HTTPS in production to encrypt data in transit
- **Rate Limiting**: API endpoints are protected against brute force attacks
- **Input Validation**: All user inputs are validated and sanitized
- **CORS**: Configure CORS settings for your production environment
- **HTTP Security Headers**: Helmet.js is used to set security-related HTTP headers
- **Environment Variables**: Keep sensitive information in environment variables

## Future Enhancements

- **Multi-factor Authentication (MFA)**: Add support for TOTP and SMS-based MFA
- **SAML Integration**: Support for SAML identity providers
- **WebAuthn/FIDO2**: Passwordless authentication with security keys
- **Magic Link Authentication**: Email-based passwordless login
- **User Impersonation**: Allow admins to impersonate users for support
- **Audit Logs**: Comprehensive logging of authentication events
- **User Metrics**: Advanced analytics on user authentication patterns
- **Custom Domains**: Support for custom domains for tenants
- **Localization**: Multi-language support for the UI and emails
- **Enterprise Features**: SSO, LDAP integration, and more

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
