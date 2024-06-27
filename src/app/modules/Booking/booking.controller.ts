import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BookingService } from './booking.service';
import { Types } from 'mongoose';
import { verifyToken } from '../../middlewares/auth';
import AppError from '../../errors/AppError';
import noDataFound from '../../middlewares/noDataFound';

const createBooking = catchAsync(async (req, res) => {
  const bookingData = req.body;
  const booking = await BookingService.createBooking(bookingData);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Booking created successfully',
    data: booking,
  });
});

const getBooking = catchAsync(async (req, res) => {
  const bookingId = new Types.ObjectId(req.params.id);
  const booking = await BookingService.getBooking(bookingId);

  if (!booking) {
    return noDataFound(res);
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Booking retrived successfully',
    data: booking,
  });
});

const getAllBookings = catchAsync(async (req, res) => {
  const booking = await BookingService.getAllBookings();

  if (booking.length === 0) {
    return noDataFound(res);
  }
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'All bookings retrieved successfully',
    data: booking,
  });
});

const getUserBookings = catchAsync(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    throw new AppError(httpStatus.NOT_FOUND, 'Authorization token not found');
  }

  const decodedToken = verifyToken(token);
  const userEmail = decodedToken.email;

  const booking = await BookingService.getUserBookings(userEmail);

  if (booking.length === 0) {
    return noDataFound(res);
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User bookings retrieved successfully',
    data: booking,
  });
});

const updateBooking = catchAsync(async (req, res) => {
  const bookingId = new Types.ObjectId(req.params.id);
  const updatedData = req.body;

  const booking = await BookingService.updateBooking(bookingId, updatedData);

  if (!booking) {
    sendResponse(res, {
      success: false,
      statusCode: httpStatus.NOT_FOUND,
      message: 'Booking not found',
    });
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Booking updated successfully',
    data: booking,
  });
});

const deleteBooking = catchAsync(async (req, res) => {
  const bookingId = new Types.ObjectId(req.params.id);
  const deletedData = await BookingService.deleteBooking(bookingId);

  if (!deletedData) {
    sendResponse(res, {
      success: false,
      statusCode: httpStatus.NOT_FOUND,
      message: 'Failed to delete booking!',
    });
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Booking deleted successfully',
    data: deletedData,
  });
});

export const BookingController = {
  createBooking,
  getBooking,
  getAllBookings,
  getUserBookings,
  updateBooking,
  deleteBooking,
};
