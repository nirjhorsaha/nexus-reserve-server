import { z } from 'zod';
import { Types } from 'mongoose';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createBookingValidationSchema = z.object({
  body: z.object({
    room: z
      .string()
      .refine((id) => objectIdRegex.test(id), { message: 'Invalid Room ID' }),
    slots: z
      .array(
        z.string().refine((id) => objectIdRegex.test(id), {
          message: 'Invalid Slot ID',
        }),
      )
      .nonempty({ message: 'At least one slot must be provided' }),
    user: z
      .string()
      .refine((id) => objectIdRegex.test(id), { message: 'Invalid User ID' }),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: 'Date must be in YYYY-MM-DD format',
    }),
    // totalAmount: z
    //   .number()
    //   .min(0, { message: 'Total amount must be a positive number' }),
    // isConfirmed: z.enum(['confirmed', 'unconfirmed', 'canceled'])
    // isDeleted: z.boolean().default(false),
  }),
});

const updateBookingValidationSchema = z.object({
  room: z
    .string()
    .refine((id) => objectIdRegex.test(id), { message: 'Invalid Room ID' })
    .optional(),
  slots: z
    .array(
      z
        .string()
        .refine((id) => objectIdRegex.test(id), { message: 'Invalid Slot ID' }),
    )
    .nonempty({ message: 'At least one slot must be provided' })
    .optional(),
  user: z
    .string()
    .refine((id) => objectIdRegex.test(id), { message: 'Invalid User ID' })
    .optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: 'Date must be in YYYY-MM-DD format',
    })
    .optional(),
  totalAmount: z
    .number()
    .min(0, { message: 'Total amount must be a positive number' })
    .optional(),
  isConfirmed: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
});

const bookingIdValidationSchema = z.object({
  id: z.instanceof(Types.ObjectId).refine((id) => Types.ObjectId.isValid(id)),
});

export const BookingValidation = {
  createBookingValidationSchema,
  updateBookingValidationSchema,
  bookingIdValidationSchema,
};
