import { Router } from 'express';
import { permissionController } from '../controller/permission.controller';
import { authenticate, authorize } from '../../../middlewares';

const router = Router();
router.use(authenticate);
router.get('/', authorize('permissions.view'), permissionController.findAll.bind(permissionController));
router.get('/:id', authorize('permissions.view'), permissionController.findById.bind(permissionController));
router.post('/', authorize('permissions.create'), permissionController.create.bind(permissionController));
router.put('/:id', authorize('permissions.update'), permissionController.update.bind(permissionController));
router.delete('/:id', authorize('permissions.delete'), permissionController.delete.bind(permissionController));
export default router;
