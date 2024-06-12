import { Types } from 'mongoose';

export interface ISlot {
  room: Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  isBooked?: boolean;
}
