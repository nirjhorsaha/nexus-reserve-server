import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BookingService } from './booking.service';
import jwt from 'jsonwebtoken'; 

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

const getAllBookings = catchAsync(async (req, res) => {
  const booking = await BookingService.getAllBookings();

  if (booking.length === 0) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.NOT_FOUND,
      message: 'No Data Found',
      data: [],
    });
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
    throw new Error('Authorization token not found');
  }

  const decodedToken = jwt.verify(
    token,
    process.env.jwt_access_secret as string,
  ) as {
    email: string;
  };
  const userEmail = decodedToken.email;

  const bookings = await BookingService.getUserBookings(userEmail);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User bookinigs retrieved successfully',
    data: bookings,
  });
});

export const BookingController = {
  createBooking,
  getAllBookings,
  getUserBookings,
};
