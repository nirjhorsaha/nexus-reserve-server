import express from 'express';
import { UserController } from '../User/user.controller';

const router = express.Router();

router.get('/', UserController.getAllUsers);

export const UserRoutes = router;
