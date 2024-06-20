import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Room } from '../Room/room.model';
import { IBooking } from './booking.interface';
import { User } from '../User/user.model';
import { Slot } from '../Slot/slot.model';
import { Booking } from './booking.model';

const createBooking = async (bookingData: IBooking) => {
  const { date, slots, room: roomId, user: userId } = bookingData;

  const room = await Room.findById(roomId);
  if (!room) {
    throw new AppError(httpStatus.NOT_FOUND, 'Room not found');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const bookingSlots = await Slot.find({
    _id: { $in: slots },
    isBooked: false,
  });

  if (bookingSlots.length !== slots.length) {
    throw new AppError(httpStatus.NOT_FOUND, 'Slots not found');
  }

  const totalAmount = bookingSlots.length * room.pricePerSlot;

  const slotId = bookingSlots.map((slot) => slot._id);
  await Slot.updateMany({ _id: { $in: slotId } }, { isBooked: true });

  const booking = new Booking({
    date,
    slots: bookingSlots,
    room: roomId,
    user: userId,
    totalAmount,
    isConfirmed: 'unconfirmed',
    isDeleted: false,
  });
//   await booking.save();

  await booking.populate('slots');

  await booking.populate('room');
  await booking.populate('user');

  return booking;
};

export const BookingService = {
  createBooking,
};
