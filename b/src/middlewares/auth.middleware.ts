import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { IJwtPayload } from '../shared/interfaces/base.interface';
import { sendUnauthorized, sendForbidden } from '../utils/response';

declare global {
  namespace Express {
    interface Request {
      user?: IJwtPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendUnauthorized(res, 'لم يتم تقديم رمز الدخول');
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as IJwtPayload;

    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      sendUnauthorized(res, 'انتهت صلاحية الرمز');
      return;
    }
    sendUnauthorized(res, 'رمز غير صالح');
  }
}

export function authorize(...permissions: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res);
      return;
    }

    if (permissions.length === 0) {
      next();
      return;
    }

    const hasPermission = permissions.some((permission) =>
      req.user!.permissions.includes(permission)
    );

    if (!hasPermission) {
      sendForbidden(res, 'ليس لديك صلاحية لتنفيذ هذا الإجراء');
      return;
    }

    next();
  };
}

export function authorizeRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res);
      return;
    }

    if (!roles.includes(req.user.roleId)) {
      sendForbidden(res, 'ليس لديك الصلاحية المطلوبة');
      return;
    }

    next();
  };
}
