import { Request, Response } from 'express';
import { SlotService } from './slot.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import noDataFound from '../../middlewares/noDataFound';

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
    return noDataFound(res);
  }

  return sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Available slots retrieved successfully',
    data: availableSlots,
  });
});

const getAllSlots = catchAsync(async (req: Request, res: Response) => {
  const allSlots = await SlotService.getAllSlots();

  if (allSlots.length === 0) {
    return noDataFound(res);
  }

  return sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'All slots retrieved successfully',
    data: allSlots,
  });
});


export const SlotController = {
  createSlot,
  getAvailableSlots,
  getAllSlots
};
