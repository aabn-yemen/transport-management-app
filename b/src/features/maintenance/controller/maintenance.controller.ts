import { Request, Response, NextFunction } from 'express';
import { maintenanceService } from '../service/maintenance.service';
import { sendSuccess, sendCreated } from '../../../utils/response';

export class MaintenanceController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await maintenanceService.findAll(req.query as any);
      sendSuccess(res, result.data, 'تم جلب سجلات الصيانة بنجاح', 200, result.pagination);
    } catch (error) { next(error); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const d = await maintenanceService.findById(String(req.params.id));
      sendSuccess(res, d);
    } catch (e) { next(e); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const d = await maintenanceService.create(req.body, req.user?.userId);
      sendCreated(res, d);
    } catch (e) { next(e); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const d = await maintenanceService.update(String(req.params.id), req.body, req.user?.userId);
      sendSuccess(res, d);
    } catch (e) { next(e); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await maintenanceService.delete(String(req.params.id), req.user?.userId);
      sendSuccess(res, null);
    } catch (e) { next(e); }
  }

  async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const d = await maintenanceService.approve(String(req.params.id), req.user?.userId);
      sendSuccess(res, d, 'تم الموافقة على الصيانة بنجاح');
    } catch (e) { next(e); }
  }

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const d = await maintenanceService.reject(String(req.params.id), req.user?.userId);
      sendSuccess(res, d, 'تم رفض الصيانة بنجاح');
    } catch (e) { next(e); }
  }

  async start(req: Request, res: Response, next: NextFunction) {
    try {
      const d = await maintenanceService.start(String(req.params.id), req.user?.userId);
      sendSuccess(res, d, 'تم بدء الصيانة بنجاح');
    } catch (e) { next(e); }
  }

  async finish(req: Request, res: Response, next: NextFunction) {
    try {
      const d = await maintenanceService.finish(String(req.params.id), req.user?.userId);
      sendSuccess(res, d, 'تم إنهاء الصيانة بنجاح');
    } catch (e) { next(e); }
  }
}

export const maintenanceController = new MaintenanceController();
