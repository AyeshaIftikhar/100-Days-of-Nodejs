const ChatService = require('../services/chatService');
const User = require('../models/User');
const Room = require('../models/Room');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');

exports.getChatRooms = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const rooms = await Room.find({ participants: userId })
    .populate('participants', 'name avatar isOnline lastSeen')
    .populate('latestMessage')
    .sort('-updatedAt');

  logger.info(`Fetched rooms for user ${userId}`);

  res.status(200).json({
    status: 'success',
    results: rooms.length,
    data: {
      rooms
    }
  });
});

exports.getPrivateRoom = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { recipientId } = req.params;

  const room = await ChatService.getPrivateRoom(userId, recipientId);

  logger.info(`Fetched private room between ${userId} and ${recipientId}`);

  res.status(200).json({
    status: 'success',
    data: {
      room
    }
  });
});

exports.getMessageHistory = asyncHandler(async (req, res, next) => {
  const { roomId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const messages = await ChatService.getMessageHistory(roomId, page, limit);

  logger.info(`Fetched ${messages.length} messages for room ${roomId}`);

  res.status(200).json({
    status: 'success',
    results: messages.length,
    data: {
      messages
    }
  });
});

exports.createGroupRoom = asyncHandler(async (req, res, next) => {
  const { name, participants } = req.body;
  const creatorId = req.user._id;

  const room = await ChatService.createGroupRoom(name, creatorId, participants);

  logger.info(`Created new group room: ${room.name}`);

  res.status(201).json({
    status: 'success',
    data: {
      room
    }
  });
});