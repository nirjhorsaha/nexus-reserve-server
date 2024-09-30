import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Room } from '../Room/room.model';
import { IBooking } from './booking.interface';
import { User } from '../User/user.model';
import { Booking } from './booking.model';
import mongoose, { Types } from 'mongoose';
import { initiatePayment } from '../Payment/payment.utils';

const createBooking = async (bookingData: IBooking) => {
  const { date, room: roomId, user: userId, startTime, endTime } = bookingData;

  // Define allowed booking time range (in minutes)
  const MIN_BOOKING_TIME = 9 * 60; // 09:00 AM in minutes (9 * 60 = 540)
  const MAX_BOOKING_TIME = 20 * 60; // 20:00 PM in minutes (20 * 60 = 1200)

  // Convert startTime and endTime to minutes
  const startMinutes =
    parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
  const endMinutes =
    parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);

  // Check if the startTime and endTime are within the allowed time range
  if (startMinutes < MIN_BOOKING_TIME || endMinutes > MAX_BOOKING_TIME) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Booking time must be between 09:00 and 20:00',
    );
  }

  // Calculate duration in minutes
  const durationInMinutes = endMinutes - startMinutes;
  if (durationInMinutes <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'End time must be after start time',
    );
  }

  // Convert duration to hours
  const durationInHours = durationInMinutes / 60;

  // Start new session and transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Fetch room and user
    const room = await Room.findById(roomId).session(session);
    if (!room) {
      throw new AppError(httpStatus.NOT_FOUND, 'Room not found');
    }

    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Check room availability
    const existingBooking = await Booking.findOne({
      room: roomId,
      date,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    }).session(session);
    if (existingBooking) {
      throw new AppError(
        httpStatus.CONFLICT,
        'Room is already booked for the selected time',
      );
    }

    // Calculate total amount
    const totalAmount = durationInHours * room.pricePerSlot;

    // Create booking
    const transactionID = `TXN-${Date.now()}`;
    const booking = new Booking({
      date, 
      room: roomId,
      user: userId,
      totalAmount,
      isConfirmed: 'Unconfirmed',
      isDeleted: false,
      paymentStatus: 'Pending',
      transactionID,
      startTime,
      endTime,
    });
    await booking.save({ session });

    await booking.populate([
      { path: 'room' },
      { path: 'user' }]
    );

    // Prepare payment data
    const paymentData = {
      transactionID,
      totalAmount,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: user.phone,
      customerAddress: user.address,
    };

    // Initiate payment
    const paymentSession = await initiatePayment(paymentData);

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Return full booking details along with payment session
    return {
        booking,
        paymentSession,
    };
  } catch (error: unknown) {
    await session.abortTransaction();
    session.endSession();

    // Check if error is an instance of AppError
    if (error instanceof AppError) {
      throw error;
    }

    // Log detailed error information
    // console.error('Error details:', {
    //   message: error.message,
    //   stack: error.stack,
    //   statusCode: error.statusCode || 500,
    // });

    // Throw a generic error if not an AppError
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'An unexpected error occurred',
    );
  }
};

const getBooking = async (id: Types.ObjectId) => {
  const getBookingsbyId = await Booking.findByIdWithPopulatedFields(id);
  return getBookingsbyId;
};

const getAllBookings = async () => {
  const getAllBookings = await Booking.find().populate('room').populate('user');

  const filteredBookings = getAllBookings.filter(
    (booking) => booking.isDeleted === false,
  );

  return filteredBookings;
};

const getUserBookings = async (email: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error(`User with email ${email} not found`);
  }

  // Find bookings where user ID matches
  const bookings = await Booking.find({ user: user._id, isDeleted: false })
    .populate('room')
    .populate('user');
  return bookings;
};


const updateBooking = async (
  bookingId: Types.ObjectId,
  updatedData: Partial<IBooking>,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the existing booking
    const existingBooking = await Booking.findById(bookingId).session(session);

    if (!existingBooking) {
      throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
    }

    // Validate if the booking time is being updated
    if (updatedData.startTime && updatedData.endTime) {
      const MIN_BOOKING_TIME = 9 * 60; // 09:00 AM in minutes
      const MAX_BOOKING_TIME = 20 * 60; // 20:00 PM in minutes

      const startMinutes =
        parseInt(updatedData.startTime.split(':')[0]) * 60 + parseInt(updatedData.startTime.split(':')[1]);
      const endMinutes =
        parseInt(updatedData.endTime.split(':')[0]) * 60 + parseInt(updatedData.endTime.split(':')[1]);

      // Check if the new time is within the allowed range
      if (startMinutes < MIN_BOOKING_TIME || endMinutes > MAX_BOOKING_TIME) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Booking time must be between 09:00 and 20:00');
      }

      // Ensure end time is after start time
      if (endMinutes <= startMinutes) {
        throw new AppError(httpStatus.BAD_REQUEST, 'End time must be after start time');
      }
    }

    // Proceed to update the booking with the new data
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      updatedData,
      { new: true, session },
    )
      .populate('room')
      .populate('user');

    if (!updatedBooking) {
      throw new AppError(httpStatus.NOT_FOUND, 'Failed to update booking');
    }

    await session.commitTransaction();
    session.endSession();

    return updatedBooking;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    if (error instanceof AppError) {
      throw error; // Specific AppError
    }

    // Log the unexpected error
    // console.error('Unexpected error:', error);

    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update booking');
  }
};



    const deleteBooking = async (bookingId: Types.ObjectId) => {
      const session = await mongoose.startSession();
      session.startTransaction();
    
      try {
        // Find the existing booking
        const booking = await Booking.findById(bookingId).session(session);
    
        if (!booking) {
          throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
        }
    
        // Check if the booking is already marked as deleted
        if (booking.isDeleted) {
          throw new AppError(httpStatus.BAD_REQUEST, 'Booking is already deleted');
        }
    
        // Check if the booking is confirmed as 'Canceled'
        if (booking.isConfirmed !== 'Canceled') {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            'Booking is not canceled and cannot be deleted',
          );
        }
    
        // Proceed with marking the booking as deleted (soft delete)
        const deletedBooking = await Booking.findByIdAndUpdate(
          bookingId,
          { isDeleted: true },
          { new: true, session },
        );
    
        if (!deletedBooking) {
          throw new AppError(httpStatus.NOT_FOUND, 'Failed to delete booking');
        }
    
        await session.commitTransaction();
        session.endSession();
    
        return {
          success: true,
          statusCode: httpStatus.OK,
          message: 'Booking deleted successfully',
          data: deletedBooking, // Return deleted booking details
        };
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
    
        if (error instanceof AppError) {
          throw error; // Specific AppError
        }
    
        // Log the unexpected error
        // console.error('Unexpected error:', error);
    
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete booking');
      }
    };
    


export const BookingService = {
  createBooking,
  getBooking,
  getAllBookings,
  getUserBookings,
  updateBooking,
  deleteBooking,
};
