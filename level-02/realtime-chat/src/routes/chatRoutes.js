const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middlewares/auth');

// Protect all routes after this middleware
router.use(auth.protect);

router.get('/rooms', chatController.getChatRooms);
router.get('/private/:recipientId', chatController.getPrivateRoom);
router.get('/messages/:roomId', chatController.getMessageHistory);
router.post('/group', chatController.createGroupRoom);

module.exports = router;