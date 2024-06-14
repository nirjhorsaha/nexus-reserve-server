import { Request, Response } from 'express';
import { RoomService } from './room.service';

const createRoom = async (req: Request, res: Response) => {
  try {
    const { name, roomNo, floorNo, capacity, pricePerSlot, amenities } = req.body;

    // Validation for roomNo based on floorNo
    const roomNoPattern = (floorNo * 100) + 100; // Base starting room number for the floor
    const roomNoStart = roomNoPattern + 1; // Start of the valid room number range for the floor
    const roomNoEnd = roomNoPattern + 100; // End of the valid room number range for the floor

    if (roomNo < roomNoStart || roomNo > roomNoEnd) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: `Invalid roomNo. For floorNo ${floorNo}, roomNo should be between ${roomNoStart} and ${roomNoEnd}.`,
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

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Room added successfully',
      data: newRoom,
    });
  } catch (error:any) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message,
    });
  }
};
export const RoomController = {
     createRoom
 }