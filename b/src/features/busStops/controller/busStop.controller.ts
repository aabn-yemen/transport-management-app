import { Request, Response, NextFunction } from 'express';
import { BusStop } from '../../routes/model/busStop.model';
import { sendSuccess, sendCreated } from '../../../utils/response';

export class BusStopController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const stops = await BusStop.find().populate('routeId');
      sendSuccess(res, stops);
    } catch (error) { next(error); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const stop = await BusStop.findById(String(req.params.id)).populate('routeId');
      sendSuccess(res, stop);
    } catch (e) { next(e); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const stop = await BusStop.create(req.body);
      sendCreated(res, stop);
    } catch (e) { next(e); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const stop = await BusStop.findByIdAndUpdate(String(req.params.id), req.body, { new: true });
      sendSuccess(res, stop);
    } catch (e) { next(e); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await BusStop.findByIdAndDelete(String(req.params.id));
      sendSuccess(res, null);
    } catch (e) { next(e); }
  }
}

export const busStopController = new BusStopController();
