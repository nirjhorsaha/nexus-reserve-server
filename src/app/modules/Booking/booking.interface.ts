import { Types } from 'mongoose';

export interface IBooking {
  room: Types.ObjectId;
  slots: Types.ObjectId[];
  user: Types.ObjectId;
  date: string;
  totalAmount?: number;
  isConfirmed?: 'confirmed' | 'unconfirmed' | 'canceled';
  isDeleted?: boolean;
}
