import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/User';
import { createError } from '../middleware/errorHandler';
import { detectFaceFromBuffer, faceDescriptorToArray } from '../utils/faceRecognition';
import { getFileUrl, deleteFile } from '../utils/fileUtils';
import fs from 'fs';

export class UserController {
  static async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, employeeId, department } = req.body;
      const file = req.file;

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        throw createError('User with this email already exists', 400);
      }

      if (employeeId) {
        const existingEmployeeId = await UserModel.findByEmployeeId(employeeId);
        if (existingEmployeeId) {
          throw createError('User with this employee ID already exists', 400);
        }
      }

      let faceDescriptor: number[] | undefined;
      let imageUrl: string | undefined;

      if (file) {
        try {
          // Process face detection
          const imageBuffer = fs.readFileSync(file.path);
          const detection = await detectFaceFromBuffer(imageBuffer);

          if (!detection) {
            // Clean up uploaded file
            await deleteFile(file.path);
            throw createError('No face detected in the uploaded image', 400);
          }

          faceDescriptor = faceDescriptorToArray(detection.descriptor);
          imageUrl = getFileUrl(file.filename);
        } catch (error) {
          // Clean up uploaded file on error
          if (file.path) {
            await deleteFile(file.path);
          }
          throw createError('Failed to process face detection', 500);
        }
      }

      const user = await UserModel.create({
        name,
        email,
        employeeId,
        department,
        faceDescriptor,
        imageUrl,
        isActive: true,
      });

      res.status(201).json({
        success: true,
        data: {
          ...user,
          faceDescriptor: undefined, // Don't send face descriptor in response
        },
        message: 'User created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { active } = req.query;
      const isActive = active === 'true' ? true : active === 'false' ? false : undefined;

      const users = await UserModel.findAll(isActive);
      
      // Remove face descriptors from response
      const usersWithoutDescriptors = users.map(user => ({
        ...user,
        faceDescriptor: undefined,
      }));

      res.json({
        success: true,
        data: usersWithoutDescriptors,
        count: users.length,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id);

      if (!user) {
        throw createError('User not found', 404);
      }

      res.json({
        success: true,
        data: {
          ...user,
          faceDescriptor: undefined, // Don't send face descriptor in response
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const user = await UserModel.update(id, updates);

      if (!user) {
        throw createError('User not found', 404);
      }

      res.json({
        success: true,
        data: {
          ...user,
          faceDescriptor: undefined, // Don't send face descriptor in response
        },
        message: 'User updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const user = await UserModel.findById(id);
      if (!user) {
        throw createError('User not found', 404);
      }

      // Delete associated image file if exists
      if (user.imageUrl) {
        const filename = user.imageUrl.split('/').pop();
        if (filename) {
          try {
            await deleteFile(`./uploads/${filename}`);
          } catch (error) {
            console.error('Failed to delete image file:', error);
          }
        }
      }

      const deleted = await UserModel.delete(id);

      if (!deleted) {
        throw createError('Failed to delete user', 500);
      }

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUserFace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const file = req.file;

      if (!file) {
        throw createError('Image file is required', 400);
      }

      const user = await UserModel.findById(id);
      if (!user) {
        throw createError('User not found', 404);
      }

      try {
        // Process face detection
        const imageBuffer = fs.readFileSync(file.path);
        const detection = await detectFaceFromBuffer(imageBuffer);

        if (!detection) {
          await deleteFile(file.path);
          throw createError('No face detected in the uploaded image', 400);
        }

        const faceDescriptor = faceDescriptorToArray(detection.descriptor);
        const imageUrl = getFileUrl(file.filename);

        // Delete old image if exists
        if (user.imageUrl) {
          const oldFilename = user.imageUrl.split('/').pop();
          if (oldFilename) {
            try {
              await deleteFile(`./uploads/${oldFilename}`);
            } catch (error) {
              console.error('Failed to delete old image:', error);
            }
          }
        }

        const updatedUser = await UserModel.update(id, {
          faceDescriptor,
          imageUrl,
        });

        res.json({
          success: true,
          data: {
            ...updatedUser,
            faceDescriptor: undefined, // Don't send face descriptor in response
          },
          message: 'User face updated successfully',
        });
      } catch (error) {
        // Clean up uploaded file on error
        await deleteFile(file.path);
        throw error;
      }
    } catch (error) {
      next(error);
    }
  }
}
