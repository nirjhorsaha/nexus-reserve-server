/* eslint-disable no-unused-vars */
import { Model, Types } from 'mongoose';

export interface IBooking {
  room: Types.ObjectId;
  slots: Types.ObjectId[];
  user: Types.ObjectId;
  date: string;
  totalAmount?: number;
  isConfirmed?: 'confirmed' | 'unconfirmed' | 'canceled';
  status?: 'approved' | 'rejected';
  isDeleted?: boolean;
  paymentStatus?: string;
  transactionID?: string;
}

// Method to find bookings by id
export interface BookingModel extends Model<IBooking> {
  findByIdWithPopulatedFields(id: Types.ObjectId): Promise<IBooking | null>;
}
