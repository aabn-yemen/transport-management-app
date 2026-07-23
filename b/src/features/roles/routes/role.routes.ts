import { Router } from 'express';
import { roleController } from '../controller/role.controller';
import { authenticate, authorize } from '../../../middlewares';

const router = Router();
router.use(authenticate);
router.get('/', authorize('roles.view'), roleController.findAll.bind(roleController));
router.get('/:id', authorize('roles.view'), roleController.findById.bind(roleController));
router.post('/', authorize('roles.create'), roleController.create.bind(roleController));
router.put('/:id', authorize('roles.update'), roleController.update.bind(roleController));
router.delete('/:id', authorize('roles.delete'), roleController.delete.bind(roleController));
router.put('/:id/permissions', authorize('roles.update'), roleController.assignPermissions.bind(roleController));
export default router;
