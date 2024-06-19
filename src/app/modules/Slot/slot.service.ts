import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Slot } from './slot.model';
import { Room } from '../Room/room.model';
import { ISlot } from './slot.interface';

const createSlots = async ({ room, date, startTime, endTime }: ISlot) => {
  // Check if the room exists
  const roomExists = await Room.findById(room);
  if (!roomExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Room not found');
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

export const SlotService = {
  createSlots,
};
