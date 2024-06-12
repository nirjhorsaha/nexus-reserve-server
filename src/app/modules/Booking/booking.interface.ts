import { Types } from 'mongoose';

export interface IBooking {
  room: Types.ObjectId;
  slots: Types.ObjectId[];
  user: Types.ObjectId;
  totalAmount: number;
  isConfirmed?: 'confirmed' | 'unconfirmed' | 'canceled';
}
