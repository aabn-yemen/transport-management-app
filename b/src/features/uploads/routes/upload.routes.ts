import { Router } from 'express';
import multer from 'multer';
import { uploadController } from '../controller/upload.controller';
import { authenticate, authorize } from '../../../middlewares';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();
router.use(authenticate);

router.post('/', authorize('uploads.create'), upload.single('file'), uploadController.upload.bind(uploadController));
router.get('/', authorize('uploads.view'), uploadController.getAll.bind(uploadController));
router.get('/:id', authorize('uploads.view'), uploadController.getById.bind(uploadController));
router.delete('/:id', authorize('uploads.delete'), uploadController.delete.bind(uploadController));

export default router;
