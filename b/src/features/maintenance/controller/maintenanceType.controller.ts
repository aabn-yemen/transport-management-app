import { Request, Response, NextFunction } from 'express';
import { maintenanceTypeService } from '../service/maintenanceType.service';
import { sendSuccess, sendCreated } from '../../../utils/response';

export class MaintenanceTypeController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await maintenanceTypeService.findAll(req.query as any);
      sendSuccess(res, result.data, 'Done', 200, result.pagination);
    } catch (error) { next(error); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const d = await maintenanceTypeService.findById(String(req.params.id));
      sendSuccess(res, d);
    } catch (e) { next(e); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const d = await maintenanceTypeService.create(req.body, req.user?.userId);
      sendCreated(res, d);
    } catch (e) { next(e); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const d = await maintenanceTypeService.update(String(req.params.id), req.body, req.user?.userId);
      sendSuccess(res, d);
    } catch (e) { next(e); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await maintenanceTypeService.delete(String(req.params.id), req.user?.userId);
      sendSuccess(res, null);
    } catch (e) { next(e); }
  }
}

export const maintenanceTypeController = new MaintenanceTypeController();
