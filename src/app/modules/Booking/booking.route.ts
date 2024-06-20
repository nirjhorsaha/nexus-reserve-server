import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { BookingController } from './booking.controller';
import { BookingValidation } from './booking.validation';
import { authenticateUser, authorizeAdmin } from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/',
  authenticateUser,
  validateRequest(BookingValidation.createBookingValidationSchema),
  BookingController.createBooking,
);

router.get(
  '/',
  authenticateUser,
  authorizeAdmin,
  BookingController.getAllBookings,
);

export const BookingRoutes = router;
