import { Request, Response, NextFunction } from 'express';
import { uploadService } from '../service/upload.service';
import { sendSuccess, sendCreated, sendNotFound } from '../../../utils/response';

export class UploadController {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        sendNotFound(res, 'لم يتم اختيار ملف');
        return;
      }
      const upload = await uploadService.upload(
        req.file,
        req.user?.userId,
        req.body.relatedTo,
        req.body.relatedId
      );
      sendCreated(res, upload, 'تم رفع الملف بنجاح');
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await uploadService.getAll(req.query);
      sendSuccess(res, result.data, 'تم جلب الملفات بنجاح', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const upload = await uploadService.getById(String(req.params.id));
      if (!upload) {
        sendNotFound(res, 'الملف غير موجود');
        return;
      }
      sendSuccess(res, upload, 'تم جلب الملف بنجاح');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await uploadService.delete(String(req.params.id));
      sendSuccess(res, null, 'تم حذف الملف بنجاح');
    } catch (error) {
      next(error);
    }
  }
}

export const uploadController = new UploadController();
