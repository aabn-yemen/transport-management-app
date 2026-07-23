import { Request, Response, NextFunction } from 'express';
import { studentService } from '../service/student.service';
import { sendSuccess, sendCreated } from '../../../utils/response';

export class StudentController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, sort, order, search, includeDeleted, ...rest } = req.query as any;
      const filters: Record<string, any> = {};
      if (rest.parentId) filters.parentId = rest.parentId;
      if (rest.status) filters.status = rest.status;
      if (rest.busId) filters.busId = rest.busId;
      const result = await studentService.findAll({ page, limit, sort, order, search, includeDeleted, filters });
      sendSuccess(res, result.data, 'تم جلب الطلاب بنجاح', 200, result.pagination);
    } catch (error) { next(error); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await studentService.findById(String(req.params.id));
      sendSuccess(res, student, 'تم جلب الطالب بنجاح');
    } catch (error) { next(error); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await studentService.create(req.body, req.user?.userId);
      sendCreated(res, student, 'تم إنشاء الطالب بنجاح');
    } catch (error: any) {
      console.error('Student create error:', error.message, error.stack);
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await studentService.update(String(req.params.id), req.body, req.user?.userId);
      sendSuccess(res, student, 'تم تحديث الطالب بنجاح');
    } catch (error) { next(error); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await studentService.delete(String(req.params.id), req.user?.userId);
      sendSuccess(res, null, 'تم حذف الطالب بنجاح');
    } catch (error) { next(error); }
  }

  async restore(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await studentService.restore(String(req.params.id), req.user?.userId);
      sendSuccess(res, student, 'تم استعادة الطالب بنجاح');
    } catch (error) { next(error); }
  }

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, ...queryOptions } = req.query;
      const result = await studentService.search(q as string, queryOptions);
      sendSuccess(res, result.data, 'نتائج البحث', 200, result.pagination);
    } catch (error) { next(error); }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const student = await studentService.getMe(req.user?.userId!);
      sendSuccess(res, student, 'تم جلب بيانات الطالب بنجاح');
    } catch (error) { next(error); }
  }
  async getMyAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await studentService.getMyAttendance(req.user?.userId!);
      sendSuccess(res, result.data, 'تم جلب سجلات الحضور بنجاح');
    } catch (error) { next(error); }
  }
  async getMyTrips(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await studentService.getMyTrips(req.user?.userId!);
      sendSuccess(res, result.data, 'تم جلب رحلات الطالب بنجاح');
    } catch (error) { next(error); }
  }

  async generateQR(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await studentService.generateQR(String(req.params.id));
      sendSuccess(res, result, 'تم إنشاء رمز QR بنجاح');
    } catch (error) { next(error); }
  }
}

export const studentController = new StudentController();
