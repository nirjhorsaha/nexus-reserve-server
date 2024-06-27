/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Slot } from './slot.model';
import { Room } from '../Room/room.model';
import { ISlot } from './slot.interface';
import { Types } from 'mongoose';

const createSlots = async ({ room, date, startTime, endTime }: ISlot) => {
  const isRoomExists = await Room.findById(room);
  if (!isRoomExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Room not found');
  }

  // chech if slot is already exists for the given room and date
  const existingSlots = await Slot.find({
    room,
    date,
    $or: [
      {
        $and: [
          { startTime: { $lt: endTime } },
          { endTime: { $gt: startTime } },
        ],
      },
    ],
  });

  if (existingSlots.length > 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Slots already exists for the given room',
    );
  }

  // convert start and end time to minutes since midnight
  const startMinutes =
    parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
  const endMinutes =
    parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);

  // calculate total duration and number of slots
  const slotDuration = 60;
  const totalSlotDuration = endMinutes - startMinutes;
  const numberOfSlots = totalSlotDuration / slotDuration;

  // generate slot time interval
  const slots = [];
  for (let i = 0; i < numberOfSlots; i++) {
    const slotStartTime = startMinutes + i * slotDuration;
    const slotEndTime = slotStartTime + slotDuration;
    const slot = new Slot({
      room,
      date,
      startTime: `${Math.floor(slotStartTime / 60)
        .toString()
        .padStart(2, '0')}:${(slotStartTime % 60).toString().padStart(2, '0')}`,
      endTime: `${Math.floor(slotEndTime / 60)
        .toString()
        .padStart(2, '0')}:${(slotEndTime % 60).toString().padStart(2, '0')}`,
      isBooked: false,
    });
    slots.push(slot);
  }

  // save slots to database
  const saveSlots = await Slot.insertMany(slots);
  return saveSlots;
};

// const getAvailableSlots = async (date?: string, roomId?: string) => {
//   const query: any = { isBooked: false };

//   if (roomId) {
//     if (!Types.ObjectId.isValid(roomId)) {
//       throw new Error('Invalid roomId');
//     }

//     const existingRoom = await Room.findById(roomId);
//     if (!existingRoom || existingRoom.isDeleted) {
//       throw new AppError(httpStatus.NOT_FOUND, 'Room not found or is deleted.!!');
//     }

//     query.room = roomId;

//     if (date) {
//       const checkRoomForSpecifiedDate = await Slot.findOne({
//         room: roomId,
//         date: date,
//       });

//       if (!checkRoomForSpecifiedDate) {
//         throw new AppError(
//           httpStatus.NOT_FOUND,
//           'Room not found for the specified date',
//         );
//       }
//       query.date = date;
//     }
//   }

//   // If no date or roomId provided, return all slots that are not booked
//   if (!date && !roomId) {
//     query.date = { $exists: true };
//   }

//   const availableSlots = await Slot.find(query).populate('room');

//   return availableSlots;
// };
const getAvailableSlots = async (date?: string, roomId?: string) => {
  const query: any = { isBooked: false };

  // If roomId is provided, validate and add to query
  if (roomId) {
    if (!Types.ObjectId.isValid(roomId)) {
      throw new Error('Invalid roomId');
    }

    const existingRoom = await Room.find({ _id: roomId, isDeleted: false });
    if (existingRoom.length === 0) {
      throw new AppError(httpStatus.NOT_FOUND, 'Room not found or is deleted');
    }

    query.room = roomId;

    // If date is provided, add date to query
    if (date) {
      const checkRoomForSpecifiedDate = await Slot.find({
        room: roomId,
        date: date,
      });

      if (checkRoomForSpecifiedDate.length === 0) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          'Room not found for the specified date',
        );
      }
      query.date = date;
    }
  }

  // If no roomId is provided, fetch all rooms that are not deleted
  if (!roomId) {
    const rooms = await Room.find({ isDeleted: false });
    const roomIds = rooms.map((room) => room._id); 

    query.room = { $in: roomIds };
    query.date = { $exists: true };

    // If date is provided but no roomId, check for slots for the specified date
    if (date) {
      const checkRoomsForSpecifiedDate = await Slot.find({
        room: { $in: roomIds },
        date: date,
      });

      if (checkRoomsForSpecifiedDate.length === 0) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          'Room not found for the specified date',
        );
      }
      query.date = date;
    }
  }

  // Find available slots based on the constructed query
  const availableSlots = await Slot.find(query).populate({
    path: 'room',
    match: { isDeleted: false }, // Only populate with rooms that are not deleted
  });

  return availableSlots;
};
export const SlotService = {
  createSlots,
  getAvailableSlots,
};
