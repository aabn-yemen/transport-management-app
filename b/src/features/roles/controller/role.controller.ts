import { Request, Response, NextFunction } from 'express';
import { CrudService } from '../../../shared/services/crud.service';
import { createRepository } from '../../../shared/repositories/factory';
import { Role, IRole } from '../model/role.model';
import { sendSuccess, sendCreated } from '../../../utils/response';

const roleService = new CrudService<IRole>(createRepository<IRole>(Role), 'roles');

export class RoleController {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const r = await roleService.findAll(req.query as any);
      sendSuccess(res, r.data, 'تم جلب الأدوار بنجاح', 200, r.pagination);
    } catch (e) { next(e); }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const d = await roleService.findById(String(req.params.id));
      sendSuccess(res, d);
    } catch (e) { next(e); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const d = await roleService.create(req.body, req.user?.userId);
      sendCreated(res, d);
    } catch (e) { next(e); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const d = await roleService.update(String(req.params.id), req.body, req.user?.userId);
      sendSuccess(res, d);
    } catch (e) { next(e); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await roleService.delete(String(req.params.id), req.user?.userId);
      sendSuccess(res, null);
    } catch (e) { next(e); }
  }

  async assignPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await Role.findByIdAndUpdate(String(req.params.id), { permissions: req.body.permissions }, { new: true });
      sendSuccess(res, role, 'تم تعيين الصلاحيات بنجاح');
    } catch (e) { next(e); }
  }
}

export const roleController = new RoleController();
