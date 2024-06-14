import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { userController } from '../User/user.controller';
import { UserValidation } from '../User/user.validation';
import { AuthValidation } from './auth.validation';
import { authController } from './auth.controller';

const router = express.Router();

router.post(
  '/signup',
  validateRequest(UserValidation.createUserValidationSchema),
  userController.userSignUp,
);


router.post(
  '/login',
  validateRequest(AuthValidation.loginValidationSchema),
  authController.userlogin,
);

export const AuthRoutes = router;
