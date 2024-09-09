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
  
  if (isRoomExists.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Room is deleted and cannot be used');
  }

  // Check if the provided date is in the past
  const providedDate = new Date(date);
  const currentDate = new Date();
  
  // Reset the time part of currentDate to midnight for accurate date comparison
  currentDate.setHours(0, 0, 0, 0);
  
  // Ensure provided date is at least today
  if (providedDate < currentDate) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Cannot create slots for a past date');
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
      isDeleted: false,
    });
    slots.push(slot);
  }

  // save slots to database
  const saveSlots = await Slot.insertMany(slots);
  return saveSlots;
};

const getAvailableSlots = async (date?: string, roomId?: string) => {
  const query: any = { isBooked: false };

  // If roomId is provided, validate and add to query
  if (roomId) {
    if (!Types.ObjectId.isValid(roomId)) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid roomId');
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

  // Find available slots based on query
  const availableSlots = await Slot.find(query).populate({
    path: 'room',
    match: { isDeleted: false }, // Only populate with rooms that are not deleted
  });

  return availableSlots;
};

const getAllSlots = async (): Promise<ISlot[]> => {
  const slots = await Slot.find().populate({
    path: 'room',
    match: { isDeleted: false }, // Only populate with rooms that are not deleted
  });

  return slots;
};

const updateSlot = async (slotId: string, updateData: Partial<ISlot>) => {
  if (!Types.ObjectId.isValid(slotId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid slotId');
  }

  const slot = await Slot.findById(slotId);
  if (!slot) {
    throw new AppError(httpStatus.NOT_FOUND, 'Slot not found');
  }

  // Check if the slot is marked as deleted or is already booked
  if (slot.isDeleted || slot.isBooked) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      slot.isDeleted
        ? 'Cannot update a deleted slot'
        : 'Cannot update a booked slot',
    );
  }

  if (updateData.room) {
    const isRoomExists = await Room.findById(updateData.room);
    if (!isRoomExists) {
      throw new AppError(httpStatus.NOT_FOUND, 'Room not found');
    }
  }

  // Check for time conflicts if startTime or endTime is being updated
  if (updateData.startTime || updateData.endTime) {
    const startTime = updateData.startTime || slot.startTime;
    const endTime = updateData.endTime || slot.endTime;

    const conflictingSlots = await Slot.find({
      room: slot.room,
      date: slot.date,
      _id: { $ne: slotId }, // Exclude the current slot
      $or: [
        {
          $and: [
            { startTime: { $lt: endTime } }, // Existing slot's start time is before the new end time
            { endTime: { $gt: startTime } }, // Existing slot's end time is after the new start time
          ],
        },
      ],
    });

    if (conflictingSlots.length > 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Another slot with overlapping time exists on the same date',
      );
    }
  }

  const updatedSlot = await Slot.findByIdAndUpdate(
    slotId,
    updateData, {
    new: true,
  });

  return updatedSlot;
};

const deleteSlot = async (slotId: string) => {
  if (!Types.ObjectId.isValid(slotId)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid slotId');
  }

  const slot = await Slot.findById(slotId);
  if (!slot) {
    throw new AppError(httpStatus.NOT_FOUND, 'Slot not found');
  }

  // Check if the slot is already booked
  if (slot.isBooked) {
    throw new AppError(httpStatus.FORBIDDEN, 'Cannot delete a booked slot');
  }

  // If not booked, proceed to soft delete the slot
  const updatedSlot = await Slot.findByIdAndUpdate(
    slotId,
    { isDeleted: true },
    { new: true },
  );

  return updatedSlot;
};

export const SlotService = {
  createSlots,
  getAvailableSlots,
  getAllSlots,
  updateSlot,
  deleteSlot,
};
