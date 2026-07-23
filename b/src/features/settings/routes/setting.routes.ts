import { Router } from 'express';
import { settingController } from '../controller/setting.controller';
import { authenticate, authorize } from '../../../middlewares';

const router = Router();
router.use(authenticate);
router.get('/', authorize('settings.view'), settingController.get.bind(settingController));
router.put('/', authorize('settings.update'), settingController.update.bind(settingController));
export default router;
