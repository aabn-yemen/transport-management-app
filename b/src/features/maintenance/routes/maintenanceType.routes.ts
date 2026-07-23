import { Router } from 'express';
import { maintenanceTypeController } from '../controller/maintenanceType.controller';
import { authenticate, authorize } from '../../../middlewares';

const router = Router();
router.use(authenticate);
router.get('/', authorize('maintenance.view'), maintenanceTypeController.findAll.bind(maintenanceTypeController));
router.get('/:id', authorize('maintenance.view'), maintenanceTypeController.findById.bind(maintenanceTypeController));
router.post('/', authorize('maintenance.create'), maintenanceTypeController.create.bind(maintenanceTypeController));
router.put('/:id', authorize('maintenance.update'), maintenanceTypeController.update.bind(maintenanceTypeController));
router.delete('/:id', authorize('maintenance.delete'), maintenanceTypeController.delete.bind(maintenanceTypeController));

export default router;
