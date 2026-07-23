import { Request, Response, NextFunction } from 'express';
import { CrudService } from '../../../shared/services/crud.service';
import { createRepository } from '../../../shared/repositories/factory';
import { Route, IRoute } from '../model/route.model';
import { BusStop } from '../model/busStop.model';
import { sendSuccess, sendCreated } from '../../../utils/response';

const routeService = new CrudService<IRoute>(createRepository<IRoute>(Route), 'routes');

export class RouteController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await routeService.findAll(req.query as any);
      sendSuccess(res, r.data, 'تم جلب المسارات بنجاح', 200, r.pagination);
    } catch (e) { next(e); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const route = await Route.findById(String(req.params.id)).populate(['destinationId', 'stops']);
      sendSuccess(res, route, 'تم جلب المسار بنجاح');
    } catch (e) { next(e); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const d = await routeService.create(req.body, req.user?.userId);
      sendCreated(res, d);
    } catch (e) { next(e); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const d = await routeService.update(String(req.params.id), req.body, req.user?.userId);
      sendSuccess(res, d);
    } catch (e) { next(e); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await routeService.delete(String(req.params.id), req.user?.userId);
      sendSuccess(res, null);
    } catch (e) { next(e); }
  }

  async addStop(req: Request, res: Response, next: NextFunction) {
    try {
      const stop = await BusStop.create({ ...req.body, routeId: String(req.params.id) });
      await Route.findByIdAndUpdate(String(req.params.id), { $push: { stops: stop._id } });
      sendCreated(res, stop, 'تمت إضافة المحطة بنجاح');
    } catch (e) { next(e); }
  }

  async removeStop(req: Request, res: Response, next: NextFunction) {
    try {
      await BusStop.findByIdAndDelete(String(req.params.stopId));
      await Route.findByIdAndUpdate(String(req.params.id), { $pull: { stops: String(req.params.stopId) } });
      sendSuccess(res, null, 'تمت إزالة المحطة بنجاح');
    } catch (e) { next(e); }
  }
}

export const routeController = new RouteController();
