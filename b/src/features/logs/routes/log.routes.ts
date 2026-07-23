import { Router } from 'express';
import { logController } from '../controller/log.controller';
import { authenticate, authorize } from '../../../middlewares';

const router = Router();
router.use(authenticate);
router.get('/activity', authorize('logs.view'), logController.getActivityLogs.bind(logController));
router.get('/audit', authorize('logs.view'), logController.getAuditLogs.bind(logController));
export default router;
