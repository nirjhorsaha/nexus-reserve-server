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
  '/:id',
  authenticateUser,
  authorizeAdmin,
  BookingController.getBooking,
);

router.get(
  '/',
  authenticateUser,
  authorizeAdmin,
  BookingController.getAllBookings,
);

router.put(
  '/:id',
  authenticateUser,
  authorizeAdmin,
  validateRequest(BookingValidation.updateBookingValidationSchema),
  BookingController.updateBooking,
);

router.delete(
  '/:id',
  authenticateUser,
  authorizeAdmin,
  BookingController.deleteBooking,
);

export const BookingRoutes = router;
