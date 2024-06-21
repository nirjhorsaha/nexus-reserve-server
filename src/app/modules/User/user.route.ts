import express from 'express';
import { userController } from '../User/user.controller';

const router = express.Router();

router.get('/', userController.getAllUsers);

export const UserRoutes = router;
