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

const getAvailableSlots = catchAsync(async (req, res) => {
  const { date, roomId } = req.query;

  const availableSlots = await SlotService.getAvailableSlots(
    date as string,
    roomId as string,
  );
  if (availableSlots.length === 0) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.NOT_FOUND,
      message: 'No Data Found',
      data: [],
    });
  }

  return sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Available slots retrieved successfully',
    data: availableSlots,
  });
});

export const SlotController = {
  createSlot,
  getAvailableSlots,
};
