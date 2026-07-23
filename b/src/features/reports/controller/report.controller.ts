import { Request, Response, NextFunction } from 'express';
import { reportService } from '../service/report.service';
import { sendSuccess } from '../../../utils/response';

export class ReportController {
  async students(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await reportService.getStudentReport(req.query);
      sendSuccess(res, r, 'تم جلب تقرير الطلاب بنجاح');
    } catch (e) { next(e); }
  }

  async drivers(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await reportService.getDriverReport();
      sendSuccess(res, r, 'تم جلب تقرير السائقين بنجاح');
    } catch (e) { next(e); }
  }

  async buses(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await reportService.getBusReport();
      sendSuccess(res, r, 'تم جلب تقرير الحافلات بنجاح');
    } catch (e) { next(e); }
  }

  async attendance(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, ...filters } = req.query;
      const r = await reportService.getAttendanceReport(startDate ? new Date(startDate as string) : undefined, endDate ? new Date(endDate as string) : undefined, filters);
      sendSuccess(res, r, 'تم جلب تقرير الحضور بنجاح');
    } catch (e) { next(e); }
  }

  async subscriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await reportService.getSubscriptionReport();
      sendSuccess(res, r, 'تم جلب تقرير الاشتراكات بنجاح');
    } catch (e) { next(e); }
  }

  async maintenance(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await reportService.getMaintenanceReport();
      sendSuccess(res, r, 'تم جلب تقرير الصيانة بنجاح');
    } catch (e) { next(e); }
  }

  async fuel(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await reportService.getFuelReport();
      sendSuccess(res, r, 'تم جلب تقرير الوقود بنجاح');
    } catch (e) { next(e); }
  }

  async financial(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const r = await reportService.getFinancialReport(startDate ? new Date(startDate as string) : undefined, endDate ? new Date(endDate as string) : undefined);
      sendSuccess(res, r, 'تم جلب التقرير المالي بنجاح');
    } catch (e) { next(e); }
  }

  async exportPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, ...filters } = req.query;
      const pdf = await reportService.exportPDF(type as string || 'report', filters);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${type || 'report'}.pdf`);
      res.send(pdf);
    } catch (e) { next(e); }
  }

  async exportExcel(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, ...data } = req.query;
      const excel = await reportService.exportExcel(type as string || 'report', data.data ? JSON.parse(data.data as string) : []);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${type || 'report'}.xlsx`);
      res.send(excel);
    } catch (e) { next(e); }
  }
}

export const reportController = new ReportController();
