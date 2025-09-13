import { Request, Response } from 'express';
import { User } from '../models/User';
import { generateUserId } from '../utils/generators';

export const userController = {
  // Get all users
  async getAllUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const users = await User.find()
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments();

      return res.status(200).json({
        success: true,
        count: users.length,
        total,
        data: users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
      });
    }
  },

  // Get user by ID
  async getUserById(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const user = await User.findOne({ userId });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
      });
    }
  },

  // Create new user
  async createUser(req: Request, res: Response) {
    try {
      const { name, email } = req.body;

      if (!name || !email) {
        return res.status(400).json({
          success: false,
          error: 'Please provide name and email',
        });
      }

      const userId = generateUserId();
      const user = await User.create({
        userId,
        name,
        email,
      });

      return res.status(201).json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({
        success: false,
        error: 'Server error',
      });
    }
  },
};
