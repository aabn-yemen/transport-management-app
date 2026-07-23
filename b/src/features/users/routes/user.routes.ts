import { Router } from 'express';
import { userController } from '../controller/user.controller';
import { authenticate, authorize } from '../../../middlewares';
import { validate } from '../../../middlewares/validate.middleware';
import { createUserSchema, updateUserSchema } from '../validators/user.validator';

const router = Router();

router.use(authenticate);

router.get('/', authorize('users.view'), userController.findAll.bind(userController));
router.get('/:id', authorize('users.view'), userController.findById.bind(userController));
router.post('/', authorize('users.create'), validate(createUserSchema), userController.create.bind(userController));
router.put('/:id', authorize('users.update'), validate(updateUserSchema), userController.update.bind(userController));
router.delete('/:id', authorize('users.delete'), userController.delete.bind(userController));
router.patch('/:id/restore', authorize('users.restore'), userController.restore.bind(userController));

export default router;
