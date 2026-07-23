import { Router } from 'express';
import { authController } from '../controller/auth.controller';
import { authenticate } from '../../../middlewares';
import { validate } from '../../../middlewares/validate.middleware';
import { loginSchema, refreshTokenSchema, changePasswordSchema, updateProfileSchema, registerSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', validate(registerSchema), authController.register.bind(authController));
router.post('/login', validate(loginSchema), authController.login.bind(authController));
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken.bind(authController));
router.post('/logout', authenticate, authController.logout.bind(authController));
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword.bind(authController));
router.get('/profile', authenticate, authController.getProfile.bind(authController));
router.put('/profile', authenticate, validate(updateProfileSchema), authController.updateProfile.bind(authController));

export default router;
