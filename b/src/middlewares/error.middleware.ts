import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  if (res.headersSent) {
    return;
  }

  try {
    if (err instanceof AppError) {
      logger.warn(`Operational error: ${err.message}`, { statusCode: err.statusCode });
      res.status(err.statusCode).json({
        success: false,
        message: err.message,
        errors: err instanceof ValidationError ? err.errors : undefined,
      });
      return;
    }

    const statusCode = err.statusCode || err.status || 500;
    let message = err.message || 'خطأ داخلي في الخادم';

    if (err.name === 'ValidationError' && err.errors) {
      const messages = Object.values(err.errors).map((e: any) => e.message);
      message = messages.join(', ');
      res.status(400).json({
        success: false,
        message,
      });
      return;
    }

    if (err.name === 'CastError') {
      message = 'خطأ في بيانات الإدخال';
      res.status(400).json({
        success: false,
        message,
      });
      return;
    }

    if (err.name === 'MongoServerError' && (err as any).code === 11000) {
      const field = Object.keys((err as any).keyPattern || {})[0] || 'البيانات';
      message = `القيمة مكررة للمحقل ${field}`;
      res.status(409).json({
        success: false,
        message,
      });
      return;
    }

    logger.error(`Unexpected error: ${message}`, { stack: err.stack });

    res.status(statusCode).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'خطأ داخلي في الخادم' : message,
    });
  } catch (responseError) {
    logger.error('Error in error handler', { error: responseError });
    try {
      res.status(500).end();
    } catch (_) {}
  }
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: 'المسار غير موجود',
  });
}
