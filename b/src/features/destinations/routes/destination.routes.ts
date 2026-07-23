import { Router } from 'express';
import { destinationController } from '../controller/destination.controller';
import { authenticate, authorize } from '../../../middlewares';

const router = Router();
router.use(authenticate);
router.get('/', authorize('destinations.view'), destinationController.findAll.bind(destinationController));
router.get('/:id', authorize('destinations.view'), destinationController.findById.bind(destinationController));
router.post('/', authorize('destinations.create'), destinationController.create.bind(destinationController));
router.put('/:id', authorize('destinations.update'), destinationController.update.bind(destinationController));
router.delete('/:id', authorize('destinations.delete'), destinationController.delete.bind(destinationController));
export default router;
