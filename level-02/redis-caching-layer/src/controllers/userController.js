const User = require('../models/userModel');
const { cache, clearCache } = require('../middleware/cache');
const redisService = require('../services/redisService');

class UserController {
  static async getAllUsers(req, res) {
    try {
      const users = await User.find();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getUserById(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async createUser(req, res) {
    try {
      const user = new User(req.body);
      await user.save();
      
      // Clear cache for all users
      await redisService.clearCacheByPattern('users:*');
      
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async updateUser(req, res) {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Clear cache for this specific user and all users list
      await redisService.delete(`users:/api/users/${req.params.id}`);
      await redisService.clearCacheByPattern('users:/api/users*');
      
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  static async deleteUser(req, res) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Clear cache for this specific user and all users list
      await redisService.delete(`users:/api/users/${req.params.id}`);
      await redisService.clearCacheByPattern('users:/api/users*');
      
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = UserController;