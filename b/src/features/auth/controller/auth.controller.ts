import { Request, Response, NextFunction } from 'express';
import { authService } from '../service/auth.service';
import { sendSuccess, sendCreated, sendError } from '../../../utils/response';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      sendCreated(res, result, 'تم إنشاء الحساب بنجاح');
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;
      const device = req.headers['user-agent'] || '';
      const ipAddress = req.ip || '';
      const userAgent = req.headers['user-agent'] || '';

      const result = await authService.login(username, password, device, ipAddress, userAgent);
      sendSuccess(res, result, 'تم تسجيل الدخول بنجاح');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      sendSuccess(res, result, 'تم تحديث الرمز بنجاح');
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const device = req.headers['user-agent'] || '';
      const ipAddress = req.ip || '';
      await authService.logout(userId, device, ipAddress);
      sendSuccess(res, null, 'تم تسجيل الخروج بنجاح');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(userId, currentPassword, newPassword);
      sendSuccess(res, null, 'تم تغيير كلمة المرور بنجاح');
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const user = await authService.getProfile(userId);
      sendSuccess(res, user, 'تم جلب الملف الشخصي بنجاح');
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const user = await authService.updateProfile(userId, req.body);
      sendSuccess(res, user, 'تم تحديث الملف الشخصي بنجاح');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
