import { Schema, Types, model } from 'mongoose';
import { BookingModel, IBooking } from './booking.interface';

const bookingSchema = new Schema<IBooking, BookingModel>(
  {
    date: {
      type: String,
      required: true,
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
    },
    isConfirmed: {
      type: String,
      enum: ['Confirmed', 'Unconfirmed', 'Canceled'],
    },
    status: {
      type: String,
      enum: ['Approved', 'Rejected', 'Pending'],
      default: 'Pending',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
    transactionID: {
      type: String,
      // required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Static methods to find a bookings by id
bookingSchema.statics.findByIdWithPopulatedFields = function (
  id: Types.ObjectId,
) {
  return this.findById(id).populate('room').populate('user');
};

export const Booking = model<IBooking, BookingModel>('Booking', bookingSchema);

// isConfirmed: {
//   type: String,
//   enum: {
//     values: ['confirmed', 'unconfirmed', 'canceled']
//   },
// },
