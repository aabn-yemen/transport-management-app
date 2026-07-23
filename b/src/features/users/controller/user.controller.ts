import { Request, Response, NextFunction } from 'express';
import { userService } from '../service/user.service';
import { sendSuccess, sendCreated } from '../../../utils/response';

export class UserController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.findAll(req.query as any);
      sendSuccess(res, result.data, 'تم جلب المستخدمين بنجاح', 200, result.pagination);
    } catch (error) { next(error); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.findById(String(req.params.id));
      sendSuccess(res, user, 'تم جلب المستخدم بنجاح');
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.create(req.body, req.user?.userId);
      sendCreated(res, user, 'تم إنشاء المستخدم بنجاح');
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.update(String(req.params.id), req.body, req.user?.userId);
      sendSuccess(res, user, 'تم تحديث المستخدم بنجاح');
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.delete(String(req.params.id), req.user?.userId);
      sendSuccess(res, null, 'تم حذف المستخدم بنجاح');
    } catch (error) { next(error); }
  }

  async restore(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.restore(String(req.params.id), req.user?.userId);
      sendSuccess(res, user, 'تم استعادة المستخدم بنجاح');
    } catch (error) { next(error); }
  }
}

export const userController = new UserController();
