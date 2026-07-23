import { Router } from 'express';
import { tripController } from '../controller/trip.controller';
import { authenticate, authorize } from '../../../middlewares';

const router = Router();
router.use(authenticate);

router.get('/', authorize('trips.view'), tripController.findAll.bind(tripController));
router.get('/today', authorize('trips.view'), tripController.getTodayTrips.bind(tripController));
router.get('/active', authorize('trips.view'), tripController.getActiveTrips.bind(tripController));
router.get('/:id', authorize('trips.view'), tripController.findById.bind(tripController));
router.post('/', authorize('trips.create'), tripController.create.bind(tripController));
router.put('/:id', authorize('trips.update'), tripController.update.bind(tripController));
router.delete('/:id', authorize('trips.delete'), tripController.delete.bind(tripController));
router.post('/:id/start', authorize('trips.update'), tripController.startTrip.bind(tripController));
router.post('/:id/end', authorize('trips.update'), tripController.endTrip.bind(tripController));
router.post('/:id/assign-students', authorize('trips.assign'), tripController.assignStudents.bind(tripController));

export default router;
