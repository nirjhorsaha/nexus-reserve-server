import { z } from 'zod';

const createRoomValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    roomNo: z.number().min(1, 'Room number is required'),
    floorNo: z
      .number()
      .int()
      .positive('Floor number must be a positive integer'),
    capacity: z.number().int().positive('Capacity must be a positive integer'),
    pricePerSlot: z
      .number()
      .positive('Price per slot must be a positive number'),
    amenities: z
      .array(z.string().min(1, 'Amenity cannot be empty'))
      .nonempty('At least one amenity is required'),
  }),
});

const updateRoomValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').optional(),
    roomNo: z.string().min(1, 'Room number is required').optional(),
    floorNo: z
      .number()
      .int()
      .positive('Floor number must be a positive integer')
      .optional(),
    capacity: z
      .number()
      .int()
      .positive('Capacity must be a positive integer')
      .optional(),
    pricePerSlot: z
      .number()
      .positive('Price per slot must be a positive number')
      .optional(),
    amenities: z
      .array(z.string().min(1, 'Amenity cannot be empty'))
      .nonempty('At least one amenity is required')
      .optional(),
  }),
});

export const RoomValidation = {
  createRoomValidationSchema,
  updateRoomValidationSchema,
};
