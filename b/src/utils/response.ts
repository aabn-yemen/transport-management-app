import { Response } from 'express';
import { IApiResponse, IPagination } from '../shared/interfaces/base.interface';

export function sendSuccess<T>(res: Response, data?: T, message: string = 'Success', statusCode: number = 200, pagination?: IPagination): void {
  const response: IApiResponse<T> = {
    success: true,
    message,
    data,
  };
  if (pagination) {
    response.pagination = pagination;
  }
  res.status(statusCode).json(response);
}

export function sendCreated<T>(res: Response, data?: T, message: string = 'تم الإنشاء بنجاح'): void {
  sendSuccess(res, data, message, 201);
}

export function sendError(res: Response, message: string = 'خطأ داخلي في الخادم', statusCode: number = 500, errors?: unknown[]): void {
  const response: IApiResponse = {
    success: false,
    message,
  };
  if (errors) {
    response.errors = errors;
  }
  res.status(statusCode).json(response);
}

export function sendValidationError(res: Response, errors: unknown[], message: string = 'فشلت التحقق من صحة البيانات'): void {
  sendError(res, message, 422, errors);
}

export function sendUnauthorized(res: Response, message: string = 'غير مصرح'): void {
  sendError(res, message, 401);
}

export function sendForbidden(res: Response, message: string = 'محظور'): void {
  sendError(res, message, 403);
}

export function sendNotFound(res: Response, message: string = 'المورد غير موجود'): void {
  sendError(res, message, 404);
}

export function sendConflict(res: Response, message: string = 'تعارض في البيانات'): void {
  sendError(res, message, 409);
}
