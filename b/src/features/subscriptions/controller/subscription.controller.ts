import { Request, Response, NextFunction } from 'express';
import { subscriptionService } from '../service/subscription.service';
import { sendSuccess, sendCreated } from '../../../utils/response';

export class SubscriptionController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await subscriptionService.findAll(req.query as any);
      sendSuccess(res, result.data, 'تم جلب الاشتراكات بنجاح', 200, result.pagination);
    } catch (error) { next(error); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const sub = await subscriptionService.findById(String(req.params.id));
      sendSuccess(res, sub, 'تم جلب الاشتراك بنجاح');
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const sub = await subscriptionService.create(req.body, req.user?.userId);
      sendCreated(res, sub, 'تم إنشاء الاشتراك بنجاح');
    } catch (error) { next(error); }
  }

  async renew(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, amount } = req.body;
      const sub = await subscriptionService.renew(String(req.params.id), new Date(startDate), new Date(endDate), amount, req.user?.userId);
      sendSuccess(res, sub, 'تم تجديد الاشتراك بنجاح');
    } catch (error) { next(error); }
  }

  async suspend(req: Request, res: Response, next: NextFunction) {
    try {
      const sub = await subscriptionService.suspend(String(req.params.id), req.user?.userId);
      sendSuccess(res, sub, 'تم تعليق الاشتراك بنجاح');
    } catch (error) { next(error); }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const sub = await subscriptionService.cancel(String(req.params.id), req.user?.userId);
      sendSuccess(res, sub, 'تم إلغاء الاشتراك بنجاح');
    } catch (error) { next(error); }
  }
}

export const subscriptionController = new SubscriptionController();
