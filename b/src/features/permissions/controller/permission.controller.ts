import { Request, Response, NextFunction } from 'express';
import { CrudService } from '../../../shared/services/crud.service';
import { createRepository } from '../../../shared/repositories/factory';
import { Permission, IPermission } from '../model/permission.model';
import { sendSuccess, sendCreated } from '../../../utils/response';

const permissionService = new CrudService<IPermission>(createRepository<IPermission>(Permission), 'permissions');

export class PermissionController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await permissionService.findAll(req.query as any);
      sendSuccess(res, r.data, 'تم جلب الصلاحيات بنجاح', 200, r.pagination);
    } catch (e) { next(e); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const d = await permissionService.findById(String(req.params.id));
      sendSuccess(res, d);
    } catch (e) { next(e); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const d = await permissionService.create(req.body, req.user?.userId);
      sendCreated(res, d);
    } catch (e) { next(e); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const d = await permissionService.update(String(req.params.id), req.body, req.user?.userId);
      sendSuccess(res, d);
    } catch (e) { next(e); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await permissionService.delete(String(req.params.id), req.user?.userId);
      sendSuccess(res, null);
    } catch (e) { next(e); }
  }
}

export const permissionController = new PermissionController();
