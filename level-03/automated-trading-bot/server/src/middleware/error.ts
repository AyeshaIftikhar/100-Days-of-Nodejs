import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Error interface extending Error with optional status code
export interface ApiError extends Error {
  statusCode?: number;
  errors?: any;
}

/**
 * Error handler middleware
 */
export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  logger.error(`${err.name}: ${err.message}`, { 
    method: req.method,
    url: req.url, 
    stack: err.stack,
    error: err
  });

  // Default status code
  const statusCode = err.statusCode || 500;
  
  // Return error response
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(err.errors && { errors: err.errors })
  });
};

/**
 * Not found middleware
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`) as ApiError;
  error.statusCode = 404;
  next(error);
};

/**
 * Async handler to catch async errors
 */
export const asyncHandler = (fn: Function) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
