export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'المورد غير موجود') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'غير مصرح') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'محظور') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'تعارض في البيانات') {
    super(message, 409);
  }
}

export class ValidationError extends AppError {
  public errors: unknown[];

  constructor(errors: unknown[], message: string = 'فشلت التحقق من صحة البيانات') {
    super(message, 422);
    this.errors = errors;
  }
}
