import { Router } from 'express';
import { busController } from '../controller/bus.controller';
import { authenticate, authorize } from '../../../middlewares';

const router = Router();
router.use(authenticate);

router.get('/', authorize('buses.view'), busController.findAll.bind(busController));
router.get('/:id', authorize('buses.view'), busController.findById.bind(busController));
router.get('/:id/students', authorize('buses.view'), busController.getStudents.bind(busController));
router.post('/', authorize('buses.create'), busController.create.bind(busController));
router.put('/:id', authorize('buses.update'), busController.update.bind(busController));
router.delete('/:id', authorize('buses.delete'), busController.delete.bind(busController));

export default router;
