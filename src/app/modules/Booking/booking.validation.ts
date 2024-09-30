import { z } from 'zod';
import { Types } from 'mongoose';
import { dateSchema, timeSchema, timeToMinutes } from './booking.utils';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createBookingValidationSchema = z.object({
  body: z
    .object({
      room: z
        .string()
        .refine((id) => objectIdRegex.test(id), { message: 'Invalid Room ID' }),
      // date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
      //   message: 'Date must be in YYYY-MM-DD format',
      // }),
      date: dateSchema,
      startTime: timeSchema,
      endTime: timeSchema,
      user: z
        .string()
        .refine((id) => objectIdRegex.test(id), { message: 'Invalid User ID' }),
      totalAmount: z
        .number()
        .min(0, { message: 'Total amount must be a positive number' })
        .optional(),
      isConfirmed: z.enum(['Confirmed', 'Unconfirmed', 'Canceled']).optional(),
      status: z.enum(['Approved', 'Rejected']).optional(),
      isDeleted: z.boolean().optional(),
      paymentStatus: z.enum(['Pending', 'Paid', 'Failed']).optional(),
      transactionID: z.string().optional(),
    })
    .refine(
      (data) => {
        const startMinutes = timeToMinutes(data.startTime);
        const endMinutes = timeToMinutes(data.endTime);
        return startMinutes < endMinutes;
      },
      {
        message: 'Start time must be before end time',
        path: ['endTime'],
      },
    ),
});

const updateBookingValidationSchema = z
  .object({
    room: z
      .string()
      .refine((id) => objectIdRegex.test(id), { message: 'Invalid Room ID' })
      .optional(),
    user: z
      .string()
      .refine((id) => objectIdRegex.test(id), { message: 'Invalid User ID' })
      .optional(),
    date: dateSchema.optional(),
    startTime: timeSchema.optional(),
    endTime: timeSchema.optional(),
    totalAmount: z
      .number()
      .min(0, { message: 'Total amount must be a positive number' })
      .optional(),
    isConfirmed: z.enum(['confirmed', 'unconfirmed', 'canceled']).optional(),
    status: z.enum(['approved', 'rejected']).optional(),
    isDeleted: z.boolean().optional(),
    paymentStatus: z.enum(['Pending', 'Paid', 'Failed']).optional(),
    transactionID: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        const startMinutes = timeToMinutes(data.startTime);
        const endMinutes = timeToMinutes(data.endTime);
        return startMinutes < endMinutes;
      }
      return true; // If either startTime or endTime is not provided, skip this check
    },
    {
      message: 'Start time must be before end time',
      path: ['endTime'],
    },
  );

const bookingIdValidationSchema = z.object({
  id: z.instanceof(Types.ObjectId).refine((id) => Types.ObjectId.isValid(id)),
});

export const BookingValidation = {
  createBookingValidationSchema,
  updateBookingValidationSchema,
  bookingIdValidationSchema,
};
