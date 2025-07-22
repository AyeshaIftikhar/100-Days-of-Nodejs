const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { cache } = require('../middleware/cache');

// Cache middleware with key prefix
const usersCache = cache('users');

router.get('/', usersCache, UserController.getAllUsers);
router.get('/:id', usersCache, UserController.getUserById);
router.post('/', UserController.createUser);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

module.exports = router;