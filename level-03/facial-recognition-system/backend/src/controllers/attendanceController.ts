import { Request, Response, NextFunction } from 'express';
import { AttendanceModel } from '../models/Attendance';
import { UserModel } from '../models/User';
import { createError } from '../middleware/errorHandler';
import { 
  detectFaceFromBuffer, 
  compareFaceDescriptors, 
  arrayToFaceDescriptor 
} from '../utils/faceRecognition';
import { getFileUrl } from '../utils/fileUtils';
import fs from 'fs';

export class AttendanceController {
  static async checkIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.body;
      const file = req.file;

      let recognizedUserId = userId;
      let confidence: number | undefined;
      let imageUrl: string | undefined;

      // If no userId provided, try to recognize from image
      if (!userId && file) {
        try {
          const imageBuffer = fs.readFileSync(file.path);
          const detection = await detectFaceFromBuffer(imageBuffer);

          if (!detection) {
            throw createError('No face detected in the uploaded image', 400);
          }

          // Get all users with face descriptors
          const users = await UserModel.getAllWithFaceDescriptors();
          let bestMatch: any = null;
          let bestDistance = Infinity;
          const threshold = parseFloat(process.env.FACE_RECOGNITION_THRESHOLD || '0.6');

          for (const user of users) {
            if (user.faceDescriptor) {
              const storedDescriptor = arrayToFaceDescriptor(user.faceDescriptor);
              const { distance, isMatch } = compareFaceDescriptors(
                detection.descriptor,
                storedDescriptor,
                threshold
              );

              if (isMatch && distance < bestDistance) {
                bestMatch = user;
                bestDistance = distance;
              }
            }
          }

          if (!bestMatch) {
            throw createError('Face not recognized. Please register first.', 400);
          }

          recognizedUserId = bestMatch.id;
          confidence = 1 - bestDistance;
          imageUrl = file ? getFileUrl(file.filename) : undefined;
        } catch (error) {
          // Clean up file on error
          if (file) {
            try {
              fs.unlinkSync(file.path);
            } catch (e) {
              console.error('Failed to delete file:', e);
            }
          }
          throw error;
        }
      } else if (userId) {
        // Verify user exists
        const user = await UserModel.findById(userId);
        if (!user) {
          throw createError('User not found', 404);
        }
        imageUrl = file ? getFileUrl(file.filename) : undefined;
      } else {
        throw createError('Either userId or face image is required', 400);
      }

      // Check if user already checked in today
      const todayAttendance = await AttendanceModel.getTodayAttendanceByUser(recognizedUserId);
      const lastCheckin = todayAttendance.find(log => log.type === 'checkin');
      const lastCheckout = todayAttendance.find(log => log.type === 'checkout');

      if (lastCheckin && (!lastCheckout || lastCheckin.timestamp > lastCheckout.timestamp)) {
        throw createError('User is already checked in', 400);
      }

      // Create check-in record
      const attendance = await AttendanceModel.create({
        userId: recognizedUserId,
        type: 'checkin',
        confidence,
        imageUrl,
      });

      const user = await UserModel.findById(recognizedUserId);

      res.status(201).json({
        success: true,
        data: {
          attendance,
          user: {
            id: user?.id,
            name: user?.name,
            email: user?.email,
            employeeId: user?.employeeId,
            department: user?.department,
          },
        },
        message: 'Check-in successful',
      });
    } catch (error) {
      next(error);
    }
  }

  static async checkOut(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.body;
      const file = req.file;

      let recognizedUserId = userId;
      let confidence: number | undefined;
      let imageUrl: string | undefined;

      // If no userId provided, try to recognize from image
      if (!userId && file) {
        try {
          const imageBuffer = fs.readFileSync(file.path);
          const detection = await detectFaceFromBuffer(imageBuffer);

          if (!detection) {
            throw createError('No face detected in the uploaded image', 400);
          }

          // Get all users with face descriptors
          const users = await UserModel.getAllWithFaceDescriptors();
          let bestMatch: any = null;
          let bestDistance = Infinity;
          const threshold = parseFloat(process.env.FACE_RECOGNITION_THRESHOLD || '0.6');

          for (const user of users) {
            if (user.faceDescriptor) {
              const storedDescriptor = arrayToFaceDescriptor(user.faceDescriptor);
              const { distance, isMatch } = compareFaceDescriptors(
                detection.descriptor,
                storedDescriptor,
                threshold
              );

              if (isMatch && distance < bestDistance) {
                bestMatch = user;
                bestDistance = distance;
              }
            }
          }

          if (!bestMatch) {
            throw createError('Face not recognized. Please register first.', 400);
          }

          recognizedUserId = bestMatch.id;
          confidence = 1 - bestDistance;
          imageUrl = file ? getFileUrl(file.filename) : undefined;
        } catch (error) {
          // Clean up file on error
          if (file) {
            try {
              fs.unlinkSync(file.path);
            } catch (e) {
              console.error('Failed to delete file:', e);
            }
          }
          throw error;
        }
      } else if (userId) {
        // Verify user exists
        const user = await UserModel.findById(userId);
        if (!user) {
          throw createError('User not found', 404);
        }
        imageUrl = file ? getFileUrl(file.filename) : undefined;
      } else {
        throw createError('Either userId or face image is required', 400);
      }

      // Check if user has checked in today
      const todayAttendance = await AttendanceModel.getTodayAttendanceByUser(recognizedUserId);
      const lastCheckin = todayAttendance.find(log => log.type === 'checkin');
      const lastCheckout = todayAttendance.find(log => log.type === 'checkout');

      if (!lastCheckin) {
        throw createError('User has not checked in today', 400);
      }

      if (lastCheckout && lastCheckout.timestamp > lastCheckin.timestamp) {
        throw createError('User is already checked out', 400);
      }

      // Create check-out record
      const attendance = await AttendanceModel.create({
        userId: recognizedUserId,
        type: 'checkout',
        confidence,
        imageUrl,
      });

      const user = await UserModel.findById(recognizedUserId);

      res.status(201).json({
        success: true,
        data: {
          attendance,
          user: {
            id: user?.id,
            name: user?.name,
            email: user?.email,
            employeeId: user?.employeeId,
            department: user?.department,
          },
        },
        message: 'Check-out successful',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAttendanceLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { limit, offset, startDate, endDate } = req.query;

      let logs;

      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        logs = await AttendanceModel.findByDateRange(start, end);
      } else {
        logs = await AttendanceModel.findAll(
          limit ? parseInt(limit as string) : undefined,
          offset ? parseInt(offset as string) : undefined
        );
      }

      // Enrich with user data
      const enrichedLogs = await Promise.all(
        logs.map(async (log) => {
          const user = await UserModel.findById(log.userId);
          return {
            ...log,
            user: user ? {
              id: user.id,
              name: user.name,
              email: user.email,
              employeeId: user.employeeId,
              department: user.department,
            } : null,
          };
        })
      );

      res.json({
        success: true,
        data: enrichedLogs,
        count: logs.length,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { limit } = req.query;

      const user = await UserModel.findById(userId);
      if (!user) {
        throw createError('User not found', 404);
      }

      const logs = await AttendanceModel.findByUserId(
        userId,
        limit ? parseInt(limit as string) : undefined
      );

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            employeeId: user.employeeId,
            department: user.department,
          },
          logs,
        },
        count: logs.length,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAttendanceStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const stats = await AttendanceModel.getAttendanceStats(start, end);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
