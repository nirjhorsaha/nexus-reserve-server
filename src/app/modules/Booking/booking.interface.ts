/* eslint-disable no-unused-vars */
import { Model, Types } from 'mongoose';

export interface IBooking {
  room: Types.ObjectId;
  date: string;
  startTime: string;
  endTime: string;
  user: Types.ObjectId;
  totalAmount: number;
  isConfirmed?: 'Confirmed' | 'Unconfirmed' | 'Canceled';
  status?: 'Approved' | 'Rejected';
  paymentStatus?: 'Pending' | 'Paid' | 'Failed';
  transactionID?: string;
  isDeleted?: boolean;
}

// Method to find bookings by id
export interface BookingModel extends Model<IBooking> {
  findByIdWithPopulatedFields(id: Types.ObjectId): Promise<IBooking | null>;
}
