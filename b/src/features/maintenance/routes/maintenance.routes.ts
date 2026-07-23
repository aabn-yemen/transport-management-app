import { Router } from 'express';
import { maintenanceController } from '../controller/maintenance.controller';
import { authenticate, authorize } from '../../../middlewares';

const router = Router();
router.use(authenticate);
router.get('/', authorize('maintenance.view'), maintenanceController.findAll.bind(maintenanceController));
router.get('/:id', authorize('maintenance.view'), maintenanceController.findById.bind(maintenanceController));
router.post('/', authorize('maintenance.create'), maintenanceController.create.bind(maintenanceController));
router.put('/:id', authorize('maintenance.update'), maintenanceController.update.bind(maintenanceController));
router.delete('/:id', authorize('maintenance.delete'), maintenanceController.delete.bind(maintenanceController));
router.post('/:id/approve', authorize('maintenance.approve'), maintenanceController.approve.bind(maintenanceController));
router.post('/:id/reject', authorize('maintenance.reject'), maintenanceController.reject.bind(maintenanceController));
router.post('/:id/start', authorize('maintenance.update'), maintenanceController.start.bind(maintenanceController));
router.post('/:id/finish', authorize('maintenance.update'), maintenanceController.finish.bind(maintenanceController));
export default router;
