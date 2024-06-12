import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { userController } from '../User/user.controller';
import { UserValidation } from '../User/user.validation';

const router = express.Router();

router.post(
  '/signup',
  validateRequest(UserValidation.createUserValidationSchema),
  userController.userSignUp,
);

export const AuthRoutes = router;
