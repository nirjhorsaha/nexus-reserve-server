import { Schema, model } from 'mongoose';
import { ISlot } from './slot.interface';

const slotSchema = new Schema<ISlot>({
  room: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  date: {
    type: Date,
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
  isBooked: {
    type: Boolean,
    default: false,
  },
});

export const Slot = model<ISlot>('Slot', slotSchema);
