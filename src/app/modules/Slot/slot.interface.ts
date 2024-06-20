import { Types } from 'mongoose';

export interface ISlot {
  room: Types.ObjectId;
  date: string;
  startTime: string;
  endTime: string;
  isBooked?: boolean;
}

export interface CreateSlotInput {
  room: string;
  date: string;
  startTime: string;
  endTime: string;
}
