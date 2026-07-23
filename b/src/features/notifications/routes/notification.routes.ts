import { Router } from 'express';
import { notificationController } from '../controller/notification.controller';
import { authenticate, authorize } from '../../../middlewares';

const router = Router();
router.use(authenticate);
router.get('/', authorize('notifications.view'), notificationController.findAll.bind(notificationController));
router.get('/unread-count', authorize('notifications.view'), notificationController.getUnreadCount.bind(notificationController));
router.post('/', authorize('notifications.create'), notificationController.create.bind(notificationController));
router.patch('/read-all', authorize('notifications.update'), notificationController.markAllAsRead.bind(notificationController));
router.patch('/:id/read', authorize('notifications.update'), notificationController.markAsRead.bind(notificationController));
router.delete('/:id', authorize('notifications.delete'), notificationController.delete.bind(notificationController));
export default router;
