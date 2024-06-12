import { z } from 'zod';

const createBookingValidationSchema = z.object({
  body: z.object({
    room: z.string().min(1, 'Room ID is required'),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    }),
    startTime: z
      .string()
      .refine((val) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val), {
        message: 'Invalid time format',
      }),
    endTime: z
      .string()
      .refine((val) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val), {
        message: 'Invalid time format',
      }),
  }),
});

export const BookingValidation = { createBookingValidationSchema };
