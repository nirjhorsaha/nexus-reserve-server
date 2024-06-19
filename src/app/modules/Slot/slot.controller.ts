import { Request, Response } from 'express';
import { SlotService } from './slot.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';

const createSlot = catchAsync(async (req: Request, res: Response) => {
  const slotData = req.body;
  const savedSlots = await SlotService.createSlots(slotData);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Slots created successfully',
    data: savedSlots,
  });
});

export const SlotController = {
  createSlot,
};
