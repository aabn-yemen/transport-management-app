import { Request, Response, NextFunction } from 'express';
import { attendanceService } from '../service/attendance.service';
import { sendSuccess, sendCreated } from '../../../utils/response';

export class AttendanceController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await attendanceService.findAll(req.query as any);
      sendSuccess(res, result.data, 'تم جلب سجلات الحضور بنجاح', 200, result.pagination);
    } catch (error) { next(error); }
  }

  async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId, tripId, method, latitude, longitude } = req.body;
      const attendance = await attendanceService.checkIn(studentId, tripId, method, latitude, longitude, req.user?.userId);
      sendCreated(res, attendance, 'تم تسجيل الحضور بنجاح');
    } catch (error) { next(error); }
  }

  async checkOut(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentId, tripId, method, latitude, longitude } = req.body;
      const attendance = await attendanceService.checkOut(studentId, tripId, method, latitude, longitude, req.user?.userId);
      sendSuccess(res, attendance, 'تم تسجيل الانصراف بنجاح');
    } catch (error) { next(error); }
  }

  async getByTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const records = await attendanceService.getAttendanceByTrip(String(req.params.tripId));
      sendSuccess(res, records, 'تم جلب سجلات الحضور بنجاح');
    } catch (error) { next(error); }
  }

  async getByStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await attendanceService.getAttendanceByStudent(String(req.params.studentId), req.query);
      sendSuccess(res, result.data, 'تم جلب سجلات الحضور بنجاح', 200, result.pagination);
    } catch (error) { next(error); }
  }

  async getToday(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await attendanceService.getTodayAttendance();
      sendSuccess(res, result.data, 'تم جلب حضور اليوم بنجاح');
    } catch (error) { next(error); }
  }
}

export const attendanceController = new AttendanceController();
