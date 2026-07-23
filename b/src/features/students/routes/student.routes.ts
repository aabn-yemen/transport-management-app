import { Router } from 'express';
import { studentController } from '../controller/student.controller';
import { authenticate, authorize } from '../../../middlewares';
import { validate } from '../../../middlewares/validate.middleware';
import { createStudentSchema, updateStudentSchema } from '../validators/student.validator';

const router = Router();

router.use(authenticate);

router.get('/', authorize('students.view'), studentController.findAll.bind(studentController));
router.get('/search', authorize('students.view'), studentController.search.bind(studentController));
router.get('/me/attendance', studentController.getMyAttendance.bind(studentController));
router.get('/me/trips', studentController.getMyTrips.bind(studentController));
router.get('/me', studentController.getMe.bind(studentController));
router.get('/:id', authorize('students.view'), studentController.findById.bind(studentController));
router.post('/', authorize('students.create'), validate(createStudentSchema), studentController.create.bind(studentController));
router.put('/:id', authorize('students.update'), validate(updateStudentSchema), studentController.update.bind(studentController));
router.delete('/:id', authorize('students.delete'), studentController.delete.bind(studentController));
router.patch('/:id/restore', authorize('students.restore'), studentController.restore.bind(studentController));
router.post('/:id/generate-qr', authorize('students.update'), studentController.generateQR.bind(studentController));

export default router;
