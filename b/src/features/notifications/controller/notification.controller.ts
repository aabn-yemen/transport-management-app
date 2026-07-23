import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../service/notification.service';
import { sendSuccess, sendCreated } from '../../../utils/response';

export class NotificationController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await notificationService.getUserNotifications(userId, req.query);
      sendSuccess(res, result.data, 'تم جلب الإشعارات بنجاح', 200, result.pagination);
    } catch (e) { next(e); }
  }
  async create(req: Request, res: Response, next: NextFunction) {
    try { const d = await notificationService.create(req.body, req.user?.userId); sendCreated(res, d); } catch (e) { next(e); }
  }
  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try { await notificationService.markAsRead(String(req.params.id)); sendSuccess(res, null, 'تم التحديد كمقروء'); } catch (e) { next(e); }
  }
  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try { await notificationService.markAllAsRead(req.user!.userId); sendSuccess(res, null, 'تم التحديد الكل كمقروء'); } catch (e) { next(e); }
  }
  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try { const count = await notificationService.getUnreadCount(req.user!.userId); sendSuccess(res, { count }); } catch (e) { next(e); }
  }
  async delete(req: Request, res: Response, next: NextFunction) {
    try { await notificationService.delete(String(req.params.id)); sendSuccess(res, null, 'تم حذف الإشعار'); } catch (e) { next(e); }
  }
}
export const notificationController = new NotificationController();
