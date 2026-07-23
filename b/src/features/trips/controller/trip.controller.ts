import { Request, Response, NextFunction } from 'express';
import { tripService } from '../service/trip.service';
import { sendSuccess, sendCreated } from '../../../utils/response';

export class TripController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await tripService.findAll(req.query as any);
      sendSuccess(res, result.data, 'تم جلب الرحلات بنجاح', 200, result.pagination);
    } catch (error) { next(error); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const trip = await tripService.findById(String(req.params.id));
      sendSuccess(res, trip, 'تم جلب الرحلة بنجاح');
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const trip = await tripService.create(req.body, req.user?.userId);
      sendCreated(res, trip, 'تم إنشاء الرحلة بنجاح');
    } catch (error) { next(error); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const trip = await tripService.update(String(req.params.id), req.body, req.user?.userId);
      sendSuccess(res, trip, 'تم تحديث الرحلة بنجاح');
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await tripService.delete(String(req.params.id), req.user?.userId);
      sendSuccess(res, null, 'تم حذف الرحلة بنجاح');
    } catch (error) { next(error); }
  }

  async startTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const trip = await tripService.startTrip(String(req.params.id), req.user?.userId);
      sendSuccess(res, trip, 'تم بدء الرحلة بنجاح');
    } catch (error) { next(error); }
  }

  async endTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const trip = await tripService.endTrip(String(req.params.id), req.user?.userId);
      sendSuccess(res, trip, 'تم إنهاء الرحلة بنجاح');
    } catch (error) { next(error); }
  }

  async assignStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const trip = await tripService.assignStudents(String(req.params.id), req.body.studentIds, req.user?.userId);
      sendSuccess(res, trip, 'تم تعيين الطلاب بنجاح');
    } catch (error) { next(error); }
  }

  async getTodayTrips(req: Request, res: Response, next: NextFunction) {
    try {
      const trips = await tripService.getTodayTrips();
      sendSuccess(res, trips, 'تم جلب رحلات اليوم بنجاح');
    } catch (error) { next(error); }
  }

  async getActiveTrips(req: Request, res: Response, next: NextFunction) {
    try {
      const trips = await tripService.getActiveTrips();
      sendSuccess(res, trips, 'تم جلب الرحلات النشطة بنجاح');
    } catch (error) { next(error); }
  }
}

export const tripController = new TripController();
