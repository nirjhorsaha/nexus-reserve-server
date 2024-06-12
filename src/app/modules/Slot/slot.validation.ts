import { z } from 'zod';

const createSlotValidtionSchema = z.object({
  body: z.object({
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
    room: z.string().min(1, 'Room ID is required'),
    price: z.number().positive('Price must be a positive number'),
  }),
});

const updateSlotValidationSchema = z.object({
  body: z.object({
    date: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
      })
      .optional(),
    startTime: z
      .string()
      .refine((val) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val), {
        message: 'Invalid time format',
      })
      .optional(),
    endTime: z
      .string()
      .refine((val) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val), {
        message: 'Invalid time format',
      })
      .optional(),
    room: z.string().min(1, 'Room ID is required').optional(),
    price: z.number().positive('Price must be a positive number').optional(),
  }),
});

export const Slotvalidation = {
  createSlotValidtionSchema,
  updateSlotValidationSchema,
};
