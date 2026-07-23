import { Router } from 'express';
import { attendanceController } from '../controller/attendance.controller';
import { authenticate, authorize } from '../../../middlewares';

const router = Router();
router.use(authenticate);

router.get('/', authorize('attendance.view'), attendanceController.findAll.bind(attendanceController));
router.get('/today', authorize('attendance.view'), attendanceController.getToday.bind(attendanceController));
router.get('/trip/:tripId', authorize('attendance.view'), attendanceController.getByTrip.bind(attendanceController));
router.get('/student/:studentId', authorize('attendance.view'), attendanceController.getByStudent.bind(attendanceController));
router.post('/check-in', authorize('attendance.create'), attendanceController.checkIn.bind(attendanceController));
router.post('/check-out', authorize('attendance.create'), attendanceController.checkOut.bind(attendanceController));

export default router;
