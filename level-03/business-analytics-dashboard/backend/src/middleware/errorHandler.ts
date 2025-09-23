import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

export interface ErrorResponse {
  error: string
  message: string
  status: number
  timestamp: string
  path: string
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  })

  const status = (error as any).status || 500
  const message = error.message || 'Internal Server Error'

  const errorResponse: ErrorResponse = {
    error: error.name || 'Error',
    message,
    status,
    timestamp: new Date().toISOString(),
    path: req.path,
  }

  res.status(status).json(errorResponse)
}
