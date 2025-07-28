const Message = require('../models/Message');
const Room = require('../models/Room');
const User = require('../models/User');
const logger = require('../utils/logger');

class ChatService {
  static async getPrivateRoom(user1Id, user2Id) {
    try {
      // Find existing room or create new one
      let room = await Room.findOne({
        type: 'private',
        participants: { $all: [user1Id, user2Id] }
      });

      if (!room) {
        room = new Room({
          type: 'private',
          participants: [user1Id, user2Id],
          createdBy: user1Id,
        });
        await room.save();
      }

      return room;
    } catch (error) {
      logger.error(`Error getting private room: ${error.message}`);
      throw error;
    }
  }

  static async getMessageHistory(roomId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const messages = await Message.find({ room: roomId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sender', 'name avatar');

      return messages.reverse();
    } catch (error) {
      logger.error(`Error getting message history: ${error.message}`);
      throw error;
    }
  }

  static async createGroupRoom(name, creatorId, participants) {
    try {
      const room = new Room({
        type: 'group',
        name,
        participants: [...participants, creatorId],
        createdBy: creatorId,
        admins: [creatorId],
      });

      await room.save();
      return room;
    } catch (error) {
      logger.error(`Error creating group room: ${error.message}`);
      throw error;
    }
  }
}

module.exports = ChatService;