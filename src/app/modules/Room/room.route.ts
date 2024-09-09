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

router.get('/', RoomController.getAllRoom);

router.get('/:id', RoomController.getSingleRoom);

router.patch(
  '/:id',
  authenticateUser,
  authorizeAdmin,
  validateRequest(RoomValidation.updateRoomValidationSchema),
  RoomController.updatedRoom,
);

router.delete(
  '/:id',
  authenticateUser,
  authorizeAdmin,
  RoomController.deleteRoom,
);

export const RoomsRoutes = router;
