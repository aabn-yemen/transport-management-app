import { Router } from 'express';
import { busStopController } from '../controller/busStop.controller';
import { authenticate, authorize } from '../../../middlewares';

const router = Router();
router.use(authenticate);
router.get('/', authorize('routes.view'), busStopController.findAll.bind(busStopController));
router.get('/:id', authorize('routes.view'), busStopController.findById.bind(busStopController));
router.post('/', authorize('routes.create'), busStopController.create.bind(busStopController));
router.put('/:id', authorize('routes.update'), busStopController.update.bind(busStopController));
router.delete('/:id', authorize('routes.delete'), busStopController.delete.bind(busStopController));

export default router;
