const express = require('express');
const router = express.Router();
const { 
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  addParticipants,
  leaveRoom,
  getRoomMessages
} = require('../controllers/room.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

router.post('/', createRoom);
router.get('/', getAllRooms);
router.get('/:id', getRoomById);
router.put('/:id', updateRoom);
router.post('/:id/participants', addParticipants);
router.delete('/:id/leave', leaveRoom);
router.get('/:id/messages', getRoomMessages);

module.exports = router;
