import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { createApiError } from './errorHandler';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw createApiError('Access token is required', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      throw createApiError('User not found', 401);
    }

    if (!user.isActive) {
      throw createApiError('Account is deactivated', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(createApiError('Invalid token', 401));
    }
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(createApiError('Access denied', 403));
    }

    if (!roles.includes(req.user.role)) {
      return next(createApiError('Insufficient permissions', 403));
    }

    next();
  };
};
