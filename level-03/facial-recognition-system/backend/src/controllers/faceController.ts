import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/User';
import { createError } from '../middleware/errorHandler';
import { 
  detectFaceFromBuffer, 
  compareFaceDescriptors, 
  arrayToFaceDescriptor,
  loadFaceApiModels 
} from '../utils/faceRecognition';
import fs from 'fs';

export class FaceController {
  static async loadModels(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await loadFaceApiModels();
      
      res.json({
        success: true,
        message: 'Face recognition models loaded successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async recognizeFace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = req.file;

      if (!file) {
        throw createError('Image file is required', 400);
      }

      try {
        // Detect face in uploaded image
        const imageBuffer = fs.readFileSync(file.path);
        const detection = await detectFaceFromBuffer(imageBuffer);

        if (!detection) {
          throw createError('No face detected in the uploaded image', 400);
        }

        // Get all users with face descriptors
        const users = await UserModel.getAllWithFaceDescriptors();

        if (users.length === 0) {
          res.json({
            success: true,
            data: {
              isMatch: false,
              confidence: 0,
              message: 'No registered users found',
            },
          });
          return;
        }

        // Compare with all registered faces
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

        if (bestMatch) {
          res.json({
            success: true,
            data: {
              isMatch: true,
              confidence: 1 - bestDistance, // Convert distance to confidence
              user: {
                id: bestMatch.id,
                name: bestMatch.name,
                email: bestMatch.email,
                employeeId: bestMatch.employeeId,
                department: bestMatch.department,
                imageUrl: bestMatch.imageUrl,
              },
            },
          });
        } else {
          res.json({
            success: true,
            data: {
              isMatch: false,
              confidence: 0,
              message: 'No matching face found',
            },
          });
        }
      } catch (error) {
        throw createError('Failed to process face recognition', 500);
      } finally {
        // Clean up uploaded file
        try {
          fs.unlinkSync(file.path);
        } catch (error) {
          console.error('Failed to delete temporary file:', error);
        }
      }
    } catch (error) {
      next(error);
    }
  }

  static async verifyFace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.body;
      const file = req.file;

      if (!file) {
        throw createError('Image file is required', 400);
      }

      if (!userId) {
        throw createError('User ID is required', 400);
      }

      try {
        // Get user
        const user = await UserModel.findById(userId);
        if (!user) {
          throw createError('User not found', 404);
        }

        if (!user.faceDescriptor) {
          throw createError('User does not have a registered face', 400);
        }

        // Detect face in uploaded image
        const imageBuffer = fs.readFileSync(file.path);
        const detection = await detectFaceFromBuffer(imageBuffer);

        if (!detection) {
          throw createError('No face detected in the uploaded image', 400);
        }

        // Compare faces
        const storedDescriptor = arrayToFaceDescriptor(user.faceDescriptor);
        const threshold = parseFloat(process.env.FACE_RECOGNITION_THRESHOLD || '0.6');
        const { distance, isMatch } = compareFaceDescriptors(
          detection.descriptor,
          storedDescriptor,
          threshold
        );

        res.json({
          success: true,
          data: {
            isMatch,
            confidence: 1 - distance,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              employeeId: user.employeeId,
              department: user.department,
            },
          },
        });
      } catch (error) {
        throw createError('Failed to verify face', 500);
      } finally {
        // Clean up uploaded file
        try {
          fs.unlinkSync(file.path);
        } catch (error) {
          console.error('Failed to delete temporary file:', error);
        }
      }
    } catch (error) {
      next(error);
    }
  }

  static async detectFace(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = req.file;

      if (!file) {
        throw createError('Image file is required', 400);
      }

      try {
        // Detect face in uploaded image
        const imageBuffer = fs.readFileSync(file.path);
        const detection = await detectFaceFromBuffer(imageBuffer);

        if (!detection) {
          res.json({
            success: true,
            data: {
              faceDetected: false,
              message: 'No face detected in the image',
            },
          });
        } else {
          res.json({
            success: true,
            data: {
              faceDetected: true,
              detection: {
                box: detection.detection.box,
                score: detection.detection.score,
              },
              landmarks: detection.landmarks ? detection.landmarks.positions : null,
            },
          });
        }
      } catch (error) {
        throw createError('Failed to detect face', 500);
      } finally {
        // Clean up uploaded file
        try {
          fs.unlinkSync(file.path);
        } catch (error) {
          console.error('Failed to delete temporary file:', error);
        }
      }
    } catch (error) {
      next(error);
    }
  }
}
