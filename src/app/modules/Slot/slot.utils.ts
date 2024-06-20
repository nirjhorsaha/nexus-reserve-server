import { z } from 'zod';

// Function to convert time string to minutes since midnight
export const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Date validation
export const dateSchema = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: 'Invalid date format. Expected date format is YYYY-MM-DD',
});

// Time validation
export const timeSchema = z
  .string()
  .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Invalid time format',
  });
