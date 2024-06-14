import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { RoomValidation } from './room.validation';
import { RoomController } from './room.controller';
import { authenticateUser, authorizeAdmin } from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/',
  authenticateUser,
  authorizeAdmin,
  validateRequest(RoomValidation.createRoomValidationSchema),
  RoomController.createRoom,
);

export const RoomsRoutes = router;
