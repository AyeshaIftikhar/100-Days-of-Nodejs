const Room = require('../models/room.model');
const Message = require('../models/message.model');
const User = require('../models/user.model');

// Create a new room
const createRoom = async (req, res) => {
  try {
    const { name, description, type, participants } = req.body;
    
    // Create room
    const room = await Room.create({
      name,
      description,
      type,
      creator: req.user._id,
      participants: [req.user._id, ...(participants || [])]
    });

    // Add room to user's rooms
    await User.updateMany(
      { _id: { $in: [req.user._id, ...(participants || [])] } },
      { $addToSet: { rooms: room._id } }
    );

    // Create system message for room creation
    await Message.create({
      room: room._id,
      sender: req.user._id,
      content: `${req.user.username} created the room`,
      messageType: 'system',
      readBy: [req.user._id]
    });

    res.status(201).json({
      success: true,
      room: {
        id: room._id,
        name: room.name,
        description: room.description,
        type: room.type,
        creator: room.creator,
        participants: room.participants,
        createdAt: room.createdAt
      }
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create room'
    });
  }
};

// Get all rooms
const getAllRooms = async (req, res) => {
  try {
    // Find all public rooms and private rooms where user is a participant
    const rooms = await Room.find({
      $or: [
        { type: 'public' },
        { participants: req.user._id }
      ]
    }).populate('creator participants', 'username email avatar status');
    
    res.status(200).json({
      success: true,
      count: rooms.length,
      rooms: rooms.map(room => ({
        id: room._id,
        name: room.name,
        description: room.description,
        type: room.type,
        creator: room.creator,
        participants: room.participants,
        createdAt: room.createdAt
      }))
    });
  } catch (error) {
    console.error('Get all rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rooms'
    });
  }
};

// Get room by ID
const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('creator participants', 'username email avatar status');
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user has access to the room
    if (room.type === 'private' && !room.participants.some(p => p._id.equals(req.user._id))) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this room'
      });
    }

    res.status(200).json({
      success: true,
      room: {
        id: room._id,
        name: room.name,
        description: room.description,
        type: room.type,
        creator: room.creator,
        participants: room.participants,
        createdAt: room.createdAt
      }
    });
  } catch (error) {
    console.error('Get room by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room'
    });
  }
};

// Update room
const updateRoom = async (req, res) => {
  try {
    const { name, description, type } = req.body;
    
    // Find room
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user is the creator of the room
    if (!room.creator.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only the creator can update the room'
      });
    }

    // Update room
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (type) updateData.type = type;

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('creator participants', 'username email avatar status');

    // Create system message for room update
    await Message.create({
      room: room._id,
      sender: req.user._id,
      content: `${req.user.username} updated the room information`,
      messageType: 'system',
      readBy: [req.user._id]
    });

    res.status(200).json({
      success: true,
      room: {
        id: updatedRoom._id,
        name: updatedRoom.name,
        description: updatedRoom.description,
        type: updatedRoom.type,
        creator: updatedRoom.creator,
        participants: updatedRoom.participants,
        createdAt: updatedRoom.createdAt
      }
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update room'
    });
  }
};

// Add participants to a room
const addParticipants = async (req, res) => {
  try {
    const { participants } = req.body;
    
    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide participants array'
      });
    }

    // Find room
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user is a participant in the room
    if (!room.participants.some(p => p.equals(req.user._id))) {
      return res.status(403).json({
        success: false,
        message: 'You must be a participant to add others'
      });
    }

    // Add participants to room
    await Room.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { participants: { $each: participants } } }
    );

    // Add room to users' rooms
    await User.updateMany(
      { _id: { $in: participants } },
      { $addToSet: { rooms: room._id } }
    );

    // Get participant usernames
    const newParticipants = await User.find({ _id: { $in: participants } });
    const participantNames = newParticipants.map(p => p.username).join(', ');

    // Create system message for adding participants
    await Message.create({
      room: room._id,
      sender: req.user._id,
      content: `${req.user.username} added ${participantNames} to the room`,
      messageType: 'system',
      readBy: [req.user._id]
    });

    const updatedRoom = await Room.findById(req.params.id)
      .populate('creator participants', 'username email avatar status');

    res.status(200).json({
      success: true,
      room: {
        id: updatedRoom._id,
        name: updatedRoom.name,
        description: updatedRoom.description,
        type: updatedRoom.type,
        creator: updatedRoom.creator,
        participants: updatedRoom.participants,
        createdAt: updatedRoom.createdAt
      }
    });
  } catch (error) {
    console.error('Add participants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add participants'
    });
  }
};

// Leave room
const leaveRoom = async (req, res) => {
  try {
    // Find room
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user is a participant in the room
    if (!room.participants.some(p => p.equals(req.user._id))) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this room'
      });
    }

    // If user is the creator and there are other participants, transfer ownership
    if (room.creator.equals(req.user._id) && room.participants.length > 1) {
      // Find another participant to make creator
      const newCreator = room.participants.find(p => !p.equals(req.user._id));
      
      // Update room with new creator
      await Room.findByIdAndUpdate(
        req.params.id,
        { 
          creator: newCreator,
          $pull: { participants: req.user._id }
        }
      );

      // Create system message for ownership transfer
      await Message.create({
        room: room._id,
        sender: req.user._id,
        content: `${req.user.username} transferred ownership to a new user and left the room`,
        messageType: 'system'
      });
    } else if (room.creator.equals(req.user._id) && room.participants.length <= 1) {
      // If user is the creator and there are no other participants, delete the room
      await Room.findByIdAndDelete(req.params.id);
      await Message.deleteMany({ room: req.params.id });
      
      // Remove room from user's rooms
      await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { rooms: req.params.id } }
      );

      return res.status(200).json({
        success: true,
        message: 'Room deleted successfully as you were the last participant'
      });
    } else {
      // User is not the creator, just remove from participants
      await Room.findByIdAndUpdate(
        req.params.id,
        { $pull: { participants: req.user._id } }
      );

      // Create system message for leaving
      await Message.create({
        room: room._id,
        sender: req.user._id,
        content: `${req.user.username} left the room`,
        messageType: 'system'
      });
    }

    // Remove room from user's rooms
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { rooms: req.params.id } }
    );

    res.status(200).json({
      success: true,
      message: 'You have left the room successfully'
    });
  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave room'
    });
  }
};

// Get messages for a room
const getRoomMessages = async (req, res) => {
  try {
    const roomId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Find room
    const room = await Room.findById(roomId);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user has access to the room
    if (!room.participants.some(p => p.equals(req.user._id))) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this room'
      });
    }

    // Get messages
    const messages = await Message.find({ room: roomId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username email avatar');
    
    // Get total count of messages
    const total = await Message.countDocuments({ room: roomId });

    // Mark messages as read by current user
    await Message.updateMany(
      { 
        room: roomId, 
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id }
      },
      { $addToSet: { readBy: req.user._id } }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      messages: messages.map(message => ({
        id: message._id,
        room: message.room,
        sender: message.sender,
        content: message.content,
        messageType: message.messageType,
        readBy: message.readBy,
        createdAt: message.createdAt
      }))
    });
  } catch (error) {
    console.error('Get room messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

module.exports = {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  addParticipants,
  leaveRoom,
  getRoomMessages
};
