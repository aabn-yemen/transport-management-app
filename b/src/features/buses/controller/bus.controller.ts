import { Request, Response, NextFunction } from 'express';
import { busService } from '../service/bus.service';
import { sendSuccess, sendCreated } from '../../../utils/response';

export class BusController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await busService.findAll(req.query as any);
      sendSuccess(res, result.data, 'تم جلب الحافلات بنجاح', 200, result.pagination);
    } catch (error) { next(error); }
  }
  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const bus = await busService.findById(String(req.params.id));
      sendSuccess(res, bus, 'تم جلب الحافلة بنجاح');
    } catch (error) { next(error); }
  }
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const bus = await busService.create(req.body, req.user?.userId);
      sendCreated(res, bus, 'تم إنشاء الحافلة بنجاح');
    } catch (error) { next(error); }
  }
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const bus = await busService.update(String(req.params.id), req.body, req.user?.userId);
      sendSuccess(res, bus, 'تم تحديث الحافلة بنجاح');
    } catch (error) { next(error); }
  }
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await busService.delete(String(req.params.id), req.user?.userId);
      sendSuccess(res, null, 'تم حذف الحافلة بنجاح');
    } catch (error) { next(error); }
  }
  async getStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const students = await busService.getStudents(String(req.params.id));
      sendSuccess(res, students, 'تم جلب الطلاب بنجاح');
    } catch (error) { next(error); }
  }
}
export const busController = new BusController();
