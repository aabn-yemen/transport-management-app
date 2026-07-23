import { Router } from 'express';
import { driverController } from '../controller/driver.controller';
import { authenticate, authorize } from '../../../middlewares';

const router = Router();
router.use(authenticate);

router.get('/', authorize('drivers.view'), driverController.findAll.bind(driverController));
router.get('/me/trips', driverController.getMyTrips.bind(driverController));
router.get('/me/active-trip', driverController.getMyActiveTrip.bind(driverController));
router.get('/me', driverController.getMe.bind(driverController));
router.get('/:id', authorize('drivers.view'), driverController.findById.bind(driverController));
router.post('/', authorize('drivers.create'), driverController.create.bind(driverController));
router.put('/:id', authorize('drivers.update'), driverController.update.bind(driverController));
router.delete('/:id', authorize('drivers.delete'), driverController.delete.bind(driverController));
router.post('/:id/assign-bus', authorize('drivers.assign'), driverController.assignBus.bind(driverController));
router.post('/:id/remove-bus', authorize('drivers.assign'), driverController.removeBus.bind(driverController));

export default router;
