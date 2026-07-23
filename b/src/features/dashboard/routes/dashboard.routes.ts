import { Router } from 'express';
import { dashboardController } from '../controller/dashboard.controller';
import { authenticate, authorize } from '../../../middlewares';

const router = Router();
router.use(authenticate);
router.get('/stats', authorize('dashboard.view'), dashboardController.getStats.bind(dashboardController));
router.get('/charts', authorize('dashboard.view'), dashboardController.getCharts.bind(dashboardController));
router.get('/today-trips', authorize('dashboard.view'), dashboardController.getTodayTrips.bind(dashboardController));

export default router;
