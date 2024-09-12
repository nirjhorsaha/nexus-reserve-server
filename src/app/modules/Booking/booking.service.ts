import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Room } from '../Room/room.model';
import { IBooking } from './booking.interface';
import { User } from '../User/user.model';
import { Slot } from '../Slot/slot.model';
import { Booking } from './booking.model';
import mongoose, { Types } from 'mongoose';
import { initiatePayment } from '../Payment/payment.utils';

const createBooking = async (bookingData: IBooking) => {
  const { date, slots, room: roomId, user: userId } = bookingData;

  // start new session and transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const room = await Room.findById(roomId).session(session);
    if (!room) {
      throw new AppError(httpStatus.NOT_FOUND, 'Room not found');
    }

    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    // find available slots
    const bookingSlots = await Slot.find({
      _id: { $in: slots },
      date: date,
      isBooked: false,
    }).session(session);

    // if (bookingSlots.length !== slots.length) {
    //   throw new AppError(httpStatus.NOT_FOUND, 'Slots not found');
    // }

    // calculate total amount
    const totalAmount = bookingSlots.length * room.pricePerSlot;

    // extract slot id and mark them as booked
    const slotId = bookingSlots.map((slot) => slot._id);
    await Slot.updateMany(
      { _id: { $in: slotId } },
      { isBooked: true },
      { session },
    );

    const transactionID = `TXN-${Date.now()}`;

    const booking = new Booking({
      date,
      slots: bookingSlots,
      room: roomId,
      user: userId,
      totalAmount,
      isConfirmed: 'unconfirmed',
      isDeleted: false,
      paymentStatus: 'Pending',
      transactionID,
    });
    await booking.save({ session });

    await booking.populate([
      { path: 'slots' },
      { path: 'room' },
      { path: 'user' },
    ]);

    const paymentData = {
      transactionID,
      totalAmount,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: user.phone,
      customerAddress: user.address,
    };

    const paymentSession = await initiatePayment(paymentData);

    await session.commitTransaction();
    session.endSession();

    return paymentSession;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create booking');
  }
};

// const getBooking = async (id: Types.ObjectId) => {
//   const getBookingsbyId = await Booking.findById(id)
//     .populate('room')
//     .populate('slots')
//     .populate('user');
//   return getBookingsbyId;
// };

const getBooking = async (id: Types.ObjectId) => {
  const getBookingsbyId = await Booking.findByIdWithPopulatedFields(id);
  return getBookingsbyId;
};

const getAllBookings = async () => {
  const getAllBookings = await Booking.find()
    .populate('room')
    .populate('slots')
    .populate('user');

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
    .populate('slots')
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
    const existingBooking = await Booking.findById(bookingId)
      .populate('slots')
      .session(session);

    if (!existingBooking) {
      throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
    }

    // Check if booking is being canceled
    if (updatedData.isConfirmed === 'canceled') {
      // Update the slots to set isBooked to false
      await Slot.updateMany(
        { _id: { $in: existingBooking.slots } },
        { isBooked: false },
        { session },
      );
    }

    // Proceed to update the booking with new data
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      updatedData,
      { new: true, session },
    )
      .populate('room')
      .populate('slots')
      .populate('user');

    await session.commitTransaction();
    session.endSession();

    return updatedBooking;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update booking');
  }
};

// const updateBooking = async (
//   bookingId: Types.ObjectId,
//   updatedData: Partial<IBooking>,
// ) => {
//   const updateBooking = await Booking.findByIdAndUpdate(
//     bookingId,
//     updatedData,
//     {
//       new: true,
//     },
//   )
//     .populate('room')
//     .populate('slots')
//     .populate('user');
//   return updateBooking;
// };

// const deleteBooking = async (id: Types.ObjectId) => {
//   const deleteBooking = await Booking.findByIdAndUpdate(
//     id,
//     { isDeleted: true },
//     { new: true },
//   );
//   return deleteBooking;
// };

const deleteBooking = async (id: Types.ObjectId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the booking to be deleted
    const booking = await Booking.findById(id)
      .populate('slots')
      .populate('room')
      .populate('user')
      .session(session);

    if (!booking) {
      throw new AppError(httpStatus.NOT_FOUND, 'Booking not found');
    }

    // Check if the booking is already marked as deleted
    if (booking.isDeleted) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Booking is already deleted');
    }

    // Check if the booking is confirmed as 'canceled'
    if (booking.isConfirmed !== 'canceled') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Booking is not canceled and cannot be deleted',
      );
    }

    // Check if any slot is booked
    const bookedSlots = await Slot.find({
      _id: { $in: booking.slots },
      isBooked: true,
    }).session(session);

    if (bookedSlots.length > 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Cannot delete booking as some slots are already booked',
      );
    }

    // Proceed with marking the booking as deleted
    const deletedBooking = await Booking.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true, session },
    );

    await session.commitTransaction();
    session.endSession();
    return deletedBooking;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    if (error instanceof AppError) {
      throw error;
    }

    // Handle unexpected errors
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to delete booking',
    );
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
