import { Request, Response, NextFunction } from 'express';
import { fuelService } from '../service/fuel.service';
import { sendSuccess, sendCreated } from '../../../utils/response';

export class FuelController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await fuelService.findAll(req.query as any);
      sendSuccess(res, r.data, 'تم جلب سجلات الوقود بنجاح', 200, r.pagination);
    } catch (e) { next(e); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const d = await fuelService.findById(String(req.params.id));
      sendSuccess(res, d);
    } catch (e) { next(e); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const d = await fuelService.create(req.body, req.user?.userId);
      sendCreated(res, d);
    } catch (e) { next(e); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const d = await fuelService.update(String(req.params.id), req.body, req.user?.userId);
      sendSuccess(res, d);
    } catch (e) { next(e); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await fuelService.delete(String(req.params.id), req.user?.userId);
      sendSuccess(res, null);
    } catch (e) { next(e); }
  }

  async getStatistics(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await fuelService.getStatistics(req.query.busId as string);
      sendSuccess(res, stats, 'إحصائيات الوقود');
    } catch (e) { next(e); }
  }
}

export const fuelController = new FuelController();
