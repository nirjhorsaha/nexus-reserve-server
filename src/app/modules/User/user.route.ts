import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { userController } from '../User/user.controller';
import { UserValidation } from '../User/user.validation';

const router = express.Router();

router.get(
  '/',
  userController.getAllUsers,
);

export const UserRoutes = router;
