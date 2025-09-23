import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { createError } from './errorHandler';

// User validation schemas
export const userSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  employeeId: Joi.string().optional(),
  department: Joi.string().optional(),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  employeeId: Joi.string().optional(),
  department: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});

// Attendance validation schema
export const attendanceSchema = Joi.object({
  type: Joi.string().valid('checkin', 'checkout').required(),
  userId: Joi.string().optional(),
});

// Generic validation middleware
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      throw createError(`Validation error: ${message}`, 400);
    }
    
    next();
  };
};

// File validation middleware
export const validateImageFile = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.file) {
    throw createError('Image file is required', 400);
  }

  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    throw createError('Only JPEG and PNG images are allowed', 400);
  }

  const maxSize = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB
  if (req.file.size > maxSize) {
    throw createError('File size exceeds limit', 400);
  }

  next();
};
