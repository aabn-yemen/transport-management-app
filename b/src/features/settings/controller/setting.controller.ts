import { Request, Response, NextFunction } from 'express';
import { settingService } from '../service/setting.service';
import { sendSuccess } from '../../../utils/response';

export class SettingController {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const s = await settingService.get();
      sendSuccess(res, s, 'تم جلب الإعدادات بنجاح');
    } catch (e) { next(e); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const s = await settingService.update(req.body);
      sendSuccess(res, s, 'تم تحديث الإعدادات بنجاح');
    } catch (e) { next(e); }
  }
}

export const settingController = new SettingController();
