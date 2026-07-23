import { Request, Response, NextFunction } from 'express';
import { ActivityLog } from '../model/activityLog.model';
import { AuditLog } from '../model/auditLog.model';
import { sendSuccess } from '../../../utils/response';

export class LogController {
  async getActivityLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      const filter: any = {};

      if (req.query.module) filter.module = req.query.module;
      if (req.query.action) filter.action = req.query.action;
      if (req.query.userId) filter.userId = req.query.userId;

      const [data, totalItems] = await Promise.all([
        ActivityLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('userId', 'fullName'),
        ActivityLog.countDocuments(filter),
      ]);

      sendSuccess(res, data, 'تم جلب سجلات النشاط بنجاح', 200, {
        page, limit, totalPages: Math.ceil(totalItems / limit), totalItems,
      });
    } catch (e) { next(e); }
  }

  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      const filter: any = {};

      if (req.query.collectionName) filter.collectionName = req.query.collectionName;
      if (req.query.operation) filter.operation = req.query.operation;
      if (req.query.recordId) filter.recordId = req.query.recordId;

      const [data, totalItems] = await Promise.all([
        AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('userId', 'fullName'),
        AuditLog.countDocuments(filter),
      ]);

      sendSuccess(res, data, 'تم جلب سجلات التدقيق بنجاح', 200, {
        page, limit, totalPages: Math.ceil(totalItems / limit), totalItems,
      });
    } catch (e) { next(e); }
  }
}

export const logController = new LogController();
