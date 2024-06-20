import { z } from 'zod';
import { dateSchema, timeSchema, timeToMinutes } from './slot.utils';

const createSlotValidationSchema = z.object({
  body: z
    .object({
      // date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
      date: dateSchema,
      startTime: timeSchema,
      endTime: timeSchema,
      room: z.string().min(1, 'Room ID is required'),
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

const updateSlotValidationSchema = z.object({
  body: z
    .object({
      // date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
      date: dateSchema.optional(),
      startTime: timeSchema.optional(),
      endTime: timeSchema.optional(),
      room: z.string().min(1, 'Room ID is required').optional(),
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
    ),
});

export const SlotValidation = {
  createSlotValidationSchema,
  updateSlotValidationSchema,
};
