import { Request, Response } from 'express';
import { RoomService } from './room.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';

const createRoom = catchAsync(async (req: Request, res: Response) => {
  const { name, roomNo, floorNo, capacity, pricePerSlot, amenities } = req.body;

  // Validation for roomNo based on floorNo
  const roomNoPattern = floorNo * 100 + 100; // Base starting room number for the floor
  const roomNoStart = roomNoPattern + 1; // Start of the valid room number range for the floor
  const roomNoEnd = roomNoPattern + 100; // End of the valid room number range for the floor

  if (roomNo < roomNoStart || roomNo > roomNoEnd) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: `Invalid roomNo. For floorNo ${floorNo}, roomNo should be between ${roomNoStart} and ${roomNoEnd}.`,
      data: null,
    });
  }

  const newRoom = await RoomService.createRoom({
    name,
    roomNo,
    floorNo,
    capacity,
    pricePerSlot,
    amenities,
    isDeleted: false,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Room added successfully',
    data: newRoom,
  });
});
export const RoomController = {
  createRoom,
};
