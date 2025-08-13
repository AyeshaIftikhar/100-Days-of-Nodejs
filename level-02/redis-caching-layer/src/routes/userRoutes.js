// const express = require('express');
// const router = express.Router();
// const UserController = require('../controllers/userController');
// const { cache } = require('../middleware/cache');
const express = require('express');
const router = express.Router();
const { cache } = require('../middleware/cache');
const userController = require('../controllers/userController');

// Cache middleware with key prefix
const usersCache = cache('users');

router.get('/', usersCache, userController.getAllUsers);
router.get('/:id', usersCache, userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;