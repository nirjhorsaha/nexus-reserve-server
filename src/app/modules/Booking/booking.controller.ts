import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BookingService } from './booking.service';

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
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'All bookings retrieved successfully',
    data: booking,
  });
})

export const BookingController = {
  createBooking,
  getAllBookings
};
