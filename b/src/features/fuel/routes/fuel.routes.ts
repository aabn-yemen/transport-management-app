import { Router } from 'express';
import { fuelController } from '../controller/fuel.controller';
import { authenticate, authorize } from '../../../middlewares';

const router = Router();
router.use(authenticate);
router.get('/', authorize('fuel.view'), fuelController.findAll.bind(fuelController));
router.get('/statistics', authorize('fuel.view'), fuelController.getStatistics.bind(fuelController));
router.get('/:id', authorize('fuel.view'), fuelController.findById.bind(fuelController));
router.post('/', authorize('fuel.create'), fuelController.create.bind(fuelController));
router.put('/:id', authorize('fuel.update'), fuelController.update.bind(fuelController));
router.delete('/:id', authorize('fuel.delete'), fuelController.delete.bind(fuelController));
export default router;
