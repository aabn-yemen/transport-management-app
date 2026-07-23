import { Router } from 'express';
import { reportController } from '../controller/report.controller';
import { authenticate, authorize } from '../../../middlewares';

const router = Router();
router.use(authenticate);
router.get('/students', authorize('reports.view'), reportController.students.bind(reportController));
router.get('/drivers', authorize('reports.view'), reportController.drivers.bind(reportController));
router.get('/buses', authorize('reports.view'), reportController.buses.bind(reportController));
router.get('/attendance', authorize('reports.view'), reportController.attendance.bind(reportController));
router.get('/subscriptions', authorize('reports.view'), reportController.subscriptions.bind(reportController));
router.get('/maintenance', authorize('reports.view'), reportController.maintenance.bind(reportController));
router.get('/fuel', authorize('reports.view'), reportController.fuel.bind(reportController));
router.get('/financial', authorize('reports.view'), reportController.financial.bind(reportController));
router.get('/export/pdf', authorize('reports.export'), reportController.exportPDF.bind(reportController));
router.get('/export/excel', authorize('reports.export'), reportController.exportExcel.bind(reportController));

export default router;
