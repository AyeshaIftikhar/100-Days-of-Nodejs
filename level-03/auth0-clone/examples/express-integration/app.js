require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { verifyToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Express.js Integration with Auth0 Clone',
    endpoints: {
      public: '/api/public',
      protected: '/api/protected',
      admin: '/api/admin'
    }
  });
});

// Public route - anyone can access
app.get('/api/public', (req, res) => {
  res.json({
    message: 'This is a public endpoint - no authentication required'
  });
});

// Protected route - requires authentication
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({
    message: 'This is a protected endpoint - authentication required',
    user: req.user
  });
});

// Admin route - requires authentication and admin role
app.get('/api/admin', verifyToken, (req, res) => {
  // Check if user has admin role
  const isAdmin = req.user.roles.some(role => role.name === 'admin');
  
  if (!isAdmin) {
    return res.status(403).json({
      message: 'Access denied. Admin role required.'
    });
  }
  
  res.json({
    message: 'This is an admin endpoint - admin role required',
    user: req.user
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Express integration server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to see available endpoints`);
});
