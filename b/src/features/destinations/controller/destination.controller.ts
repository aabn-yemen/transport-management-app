import { Request, Response, NextFunction } from 'express';
import { CrudService } from '../../../shared/services/crud.service';
import { createRepository } from '../../../shared/repositories/factory';
import { Destination, IDestination } from '../model/destination.model';
import { sendSuccess, sendCreated } from '../../../utils/response';

const destinationService = new CrudService<IDestination>(createRepository<IDestination>(Destination), 'destinations');

export class DestinationController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await destinationService.findAll(req.query as any);
      sendSuccess(res, r.data, 'تم جلب الوجهات بنجاح', 200, r.pagination);
    } catch (e) { next(e); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const d = await destinationService.findById(String(req.params.id));
      sendSuccess(res, d);
    } catch (e) { next(e); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const d = await destinationService.create(req.body, req.user?.userId);
      sendCreated(res, d);
    } catch (e) { next(e); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const d = await destinationService.update(String(req.params.id), req.body, req.user?.userId);
      sendSuccess(res, d);
    } catch (e) { next(e); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await destinationService.delete(String(req.params.id), req.user?.userId);
      sendSuccess(res, null);
    } catch (e) { next(e); }
  }
}

export const destinationController = new DestinationController();
