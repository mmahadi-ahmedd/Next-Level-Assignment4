import express from 'express';
import { AuthController } from './auth.controller';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AuthValidation } from './auth.validation';

const router = express.Router();

router.post('/register',validateRequest(AuthValidation.registerSchema),  AuthController.register);
router.post('/login', validateRequest(AuthValidation.loginSchema), AuthController.login);
router.get('/me', auth(), AuthController.getMe);
router.post("/refresh-token", AuthController.refreshToken)


export const AuthRoutes = router;