import { Request, Response } from 'express';
import User from '../models/user.model';
import { generateSalt } from '../utils/zkp.utils';

/**
 * Register a new user with a password commitment
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, commitment } = req.body;

    // Validate input
    if (!username || !commitment) {
      res.status(400).json({ error: 'Username and commitment are required' });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(409).json({ error: 'Username already exists' });
      return;
    }

    // Generate a random salt
    const salt = generateSalt();

    // Create the user
    const newUser = new User({
      username,
      commitment,
      salt
    });

    await newUser.save();

    // Return success without exposing sensitive data
    res.status(201).json({
      message: 'User registered successfully',
      username,
      salt
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

/**
 * Get user's salt for login
 */
export const getSalt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    // Find the user
    const user = await User.findOne({ username });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Return the salt for ZKP generation
    res.status(200).json({ salt: user.salt });
  } catch (error) {
    console.error('Get salt error:', error);
    res.status(500).json({ error: 'Server error while retrieving salt' });
  }
};

/**
 * Verify user login (without checking password, just existence)
 */
export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    // Find the user
    const user = await User.findOne({ username });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Return minimal user info
    res.status(200).json({
      username: user.username,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error while retrieving user' });
  }
};
