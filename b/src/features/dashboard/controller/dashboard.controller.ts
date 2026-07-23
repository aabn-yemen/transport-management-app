import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../service/dashboard.service';
import { sendSuccess } from '../../../utils/response';

export class DashboardController {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await dashboardService.getStats();
      sendSuccess(res, stats, 'إحصائيات لوحة التحكم');
    } catch (error) { next(error); }
  }

  async getCharts(req: Request, res: Response, next: NextFunction) {
    try {
      const charts = await dashboardService.getCharts();
      sendSuccess(res, charts, 'رسومات لوحة التحكم');
    } catch (error) { next(error); }
  }

  async getTodayTrips(req: Request, res: Response, next: NextFunction) {
    try {
      const trips = await dashboardService.getTodayTrips();
      sendSuccess(res, trips, 'رحلات اليوم');
    } catch (error) { next(error); }
  }
}

export const dashboardController = new DashboardController();
