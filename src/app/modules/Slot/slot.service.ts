/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Slot } from './slot.model';
import { Room } from '../Room/room.model';
import { ISlot } from './slot.interface';
import mongoose from 'mongoose';

const createSlots = async ({ room, date, startTime, endTime }: ISlot) => {
  // Check if the room exists
  const roomExists = await Room.findById(room);
  if (!roomExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Room not found');
  }

  // chech if slot is already exists for the given room and date
  const existingSlots = await Slot.find({
    room,
    date,
    $or: [
      // New slot starts before existing slot and ends after existing slot starts
      {
        $and: [
          { startTime: { $lte: startTime } },
          { endTime: { $gt: startTime } }
        ]
      },
      // New slot starts before existing slot ends and ends after existing slot ends
      {
        $and: [
          { startTime: { $lt: endTime } },
          { endTime: { $gte: endTime } }
        ]
      },
      // New slot starts and ends within the duration of an existing slot
      {
        $and: [
          { startTime: { $gte: startTime } },
          { endTime: { $lte: endTime } }
        ]
      }
    ]
  
  });
  if (existingSlots.length>0) {
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

const getAvailableSlots = async (date?: string, roomId?: string) => {
  const query: any = { isBooked: false };

  // if (date) {
  //   query.date = date;
  // }

  if (roomId) {
    if (!mongoose.Types.ObjectId.isValid(roomId)) {
      throw new Error('Invalid roomId');
    }
    // Check if room exists
    const existingRoom = await Room.findById(roomId);
    if (!existingRoom) {
      throw new AppError(httpStatus.NOT_FOUND, 'Room not found');
    }

    if (date) {
      const checkRoomforSpecifiedDate = await Slot.findOne({
        room: roomId,
        date: date,
      });

      if (!checkRoomforSpecifiedDate) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          'Room not found for the specified date',
        );
      }
      query.date = date;
    }
    query.room = roomId;
  }
  // if (roomId) {
  //   if (!mongoose.Types.ObjectId.isValid(roomId)) {
  //     throw new Error('Invalid roomId');
  //   }
  //   query.room = roomId;
  // }

  // If no date or roomId provided, return all slots that are not booked
  if (!date && !roomId) {
    query.date = { $exists: true };
  }

  const availableSlots = await Slot.find(query).populate('room');

  return availableSlots;
};

export const SlotService = {
  createSlots,
  getAvailableSlots,
};
