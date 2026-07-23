import { Router } from 'express';
import { routeController } from '../controller/route.controller';
import { authenticate, authorize } from '../../../middlewares';

const router = Router();
router.use(authenticate);
router.get('/', authorize('routes.view'), routeController.findAll.bind(routeController));
router.get('/:id', authorize('routes.view'), routeController.findById.bind(routeController));
router.post('/', authorize('routes.create'), routeController.create.bind(routeController));
router.put('/:id', authorize('routes.update'), routeController.update.bind(routeController));
router.delete('/:id', authorize('routes.delete'), routeController.delete.bind(routeController));
router.post('/:id/stops', authorize('routes.update'), routeController.addStop.bind(routeController));
router.delete('/:id/stops/:stopId', authorize('routes.update'), routeController.removeStop.bind(routeController));
export default router;
