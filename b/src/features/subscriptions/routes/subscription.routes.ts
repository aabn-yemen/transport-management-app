import { Router } from 'express';
import { subscriptionController } from '../controller/subscription.controller';
import { authenticate, authorize } from '../../../middlewares';

const router = Router();
router.use(authenticate);

router.get('/', authorize('subscriptions.view'), subscriptionController.findAll.bind(subscriptionController));
router.get('/:id', authorize('subscriptions.view'), subscriptionController.findById.bind(subscriptionController));
router.post('/', authorize('subscriptions.create'), subscriptionController.create.bind(subscriptionController));
router.post('/:id/renew', authorize('subscriptions.update'), subscriptionController.renew.bind(subscriptionController));
router.post('/:id/suspend', authorize('subscriptions.update'), subscriptionController.suspend.bind(subscriptionController));
router.post('/:id/cancel', authorize('subscriptions.update'), subscriptionController.cancel.bind(subscriptionController));

export default router;
