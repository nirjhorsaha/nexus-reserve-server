/* eslint-disable no-unused-vars */
import { Model, Types } from 'mongoose';

export interface IBooking {
  room: Types.ObjectId;
  slots: Types.ObjectId[];
  user: Types.ObjectId;
  date: string;
  totalAmount?: number;
  isConfirmed?: 'confirmed' | 'unconfirmed' | 'canceled';
  isDeleted?: boolean;
}

export interface BookingModel extends Model<IBooking> {
  findByIdWithPopulatedFields(id: Types.ObjectId): Promise<IBooking | null>;
}