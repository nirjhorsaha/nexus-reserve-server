import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Room } from '../Room/room.model';
import { IBooking } from './booking.interface';
import { User } from '../User/user.model';
import { Slot } from '../Slot/slot.model';
import { Booking } from './booking.model';
import mongoose, { Types } from 'mongoose';

const createBooking = async (bookingData: IBooking) => {
  const { date, slots, room: roomId, user: userId } = bookingData;

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

    const bookingSlots = await Slot.find({
      _id: { $in: slots },
      date: date,
      isBooked: false,
    }).session(session);

    if (bookingSlots.length !== slots.length) {
      throw new AppError(httpStatus.NOT_FOUND, 'Slots not found');
    }

    const totalAmount = bookingSlots.length * room.pricePerSlot;

    const slotId = bookingSlots.map((slot) => slot._id);
    await Slot.updateMany(
      { _id: { $in: slotId } },
      { isBooked: true },
      { session },
    );

    const booking = new Booking({
      date,
      slots: bookingSlots,
      room: roomId,
      user: userId,
      totalAmount,
      isConfirmed: 'unconfirmed',
      isDeleted: false,
    });
    await booking.save({ session });

    // await booking.populate('slots');

    // await booking.populate('room');
    // await booking.populate('user');
    await booking.populate([
      { path: 'slots' },
      { path: 'room' },
      { path: 'user' },
    ]);

    await session.commitTransaction();
    session.endSession();

    return booking;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create booking');
  }
};

const getBookings = async (id: string) => {
  const getBookingsbyId = await Booking.findById(id)
    .populate('room')
    .populate('slots')
    .populate('user');
  return getBookingsbyId;
};

const getAllBookings = async () => {
  const getAllBookings = await Booking.find()
    .populate('room')
    .populate('slots')
    .populate('user');
  return getAllBookings;
};

const getUserBookings = async (userId: string) => {
  const getUserBookings = await Booking.find({
    user: new Types.ObjectId(userId),
  })
    .populate('room')
    .populate('slot')
    .populate('user');
  return getUserBookings;
};

const updateBooking = async (id: string, updatedData: IBooking) => {
  const updateBooking = await Booking.findByIdAndUpdate(id, updatedData, {
    new: true,
  });
  return updateBooking;
};

const deleteBooking = async (id: string) => {
  const deleteBooking = await Booking.findByIdAndDelete(id);
  return deleteBooking;
};

export const BookingService = {
  createBooking,
  getBookings,
  getAllBookings,
  getUserBookings,
  updateBooking,
  deleteBooking,
};
