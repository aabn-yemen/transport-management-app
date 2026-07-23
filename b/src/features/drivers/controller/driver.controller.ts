import { Request, Response, NextFunction } from 'express';
import { driverService } from '../service/driver.service';
import { sendSuccess, sendCreated } from '../../../utils/response';

export class DriverController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await driverService.findAll(req.query as any);
      sendSuccess(res, result.data, 'تم جلب السائقين بنجاح', 200, result.pagination);
    } catch (error) { next(error); }
  }
  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await driverService.findById(String(req.params.id));
      sendSuccess(res, driver, 'تم جلب السائق بنجاح');
    } catch (error) { next(error); }
  }
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await driverService.create(req.body, req.user?.userId);
      sendCreated(res, driver, 'تم إنشاء السائق بنجاح');
    } catch (error) { next(error); }
  }
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await driverService.update(String(req.params.id), req.body, req.user?.userId);
      sendSuccess(res, driver, 'تم تحديث السائق بنجاح');
    } catch (error) { next(error); }
  }
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await driverService.delete(String(req.params.id), req.user?.userId);
      sendSuccess(res, null, 'تم حذف السائق بنجاح');
    } catch (error) { next(error); }
  }
  async assignBus(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await driverService.assignBus(String(req.params.id), req.body.busId, req.user?.userId);
      sendSuccess(res, driver, 'تم تعيين الحافلة للسائق بنجاح');
    } catch (error) { next(error); }
  }
  async removeBus(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await driverService.removeBus(String(req.params.id), req.user?.userId);
      sendSuccess(res, driver, 'تم إزالة الحافلة من السائق بنجاح');
    } catch (error) { next(error); }
  }
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const driver = await driverService.getMe(req.user?.userId!);
      sendSuccess(res, driver, 'تم جلب بيانات السائق بنجاح');
    } catch (error) { next(error); }
  }
  async getMyTrips(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const result = await driverService.getMyTrips(req.user?.userId!, status as string | undefined);
      sendSuccess(res, result.data, 'تم جلب رحلات السائق بنجاح');
    } catch (error) { next(error); }
  }
  async getMyActiveTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const trip = await driverService.getMyActiveTrip(req.user?.userId!);
      sendSuccess(res, trip, trip ? 'تم جلب الرحلة النشطة' : 'لا توجد رحلة نشطة');
    } catch (error) { next(error); }
  }
}
export const driverController = new DriverController();
