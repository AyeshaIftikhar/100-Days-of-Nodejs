const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Protected routes (require authentication)
// router.use(authController.protect);

// router.get('/me', userController.getMe, userController.getUser);
// router.patch('/updateMe', userController.updateMe);
// router.delete('/deleteMe', userController.deleteMe);

// Admin restricted routes
// router.use(authController.restrictTo('admin'));

// router.route('/').get(userController.getAllUsers);
// router.route('/:id').get(userController.getUser);

module.exports = router;