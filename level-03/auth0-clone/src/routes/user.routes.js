const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateJwt, authorize } = require('../middleware/auth.middleware');

// Protected routes - user profile
router.get('/me', authenticateJwt, userController.getProfile);
router.put('/me', authenticateJwt, userController.updateProfile);
router.post('/me/change-password', authenticateJwt, userController.changePassword);
router.get('/me/roles', authenticateJwt, userController.getUserRoles);

// Admin routes - user management
router.get('/', 
  authenticateJwt, 
  authorize(['read:users']), 
  userController.listUsers
);

router.get('/:userId', 
  authenticateJwt, 
  authorize(['read:users']), 
  userController.getUserById
);

router.post('/:userId/roles', 
  authenticateJwt, 
  authorize(['update:users', 'assign:roles']), 
  userController.assignRole
);

router.delete('/:userId/roles/:roleId', 
  authenticateJwt, 
  authorize(['update:users', 'assign:roles']), 
  userController.removeRole
);

module.exports = router;
