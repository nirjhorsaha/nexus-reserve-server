import { z } from 'zod';

// Helper function to convert time string to minutes since midnight
const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Date validation
const dateSchema = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: 'Invalid date format',
});

// Time validation
const timeSchema = z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
  message: 'Invalid time format',
});

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
