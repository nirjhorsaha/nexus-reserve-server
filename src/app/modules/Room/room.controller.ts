import { RoomService } from './room.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { Types } from 'mongoose';
import noDataFound from '../../middlewares/noDataFound';
// import { Booking } from '../Booking/booking.model';
// import AppError from '../../errors/AppError';

const createRoom = catchAsync(async (req, res) => {
  const { name, roomNo, floorNo, capacity, pricePerSlot, amenities, images } =
    req.body;

  // Validation for roomNo based on floorNo
  const roomNoPattern = floorNo * 100 + 100; // Base starting room number for the floor
  const roomNoStart = roomNoPattern + 1; // Start of the valid room number range for the floor
  const roomNoEnd = roomNoPattern + 100; // End of the valid room number range for the floor

  if (roomNo < roomNoStart || roomNo > roomNoEnd) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: `Invalid room no.!! For floor no: ${floorNo}, room no should be between ${roomNoStart} and ${roomNoEnd}.`,
    });
  }

  const newRoom = await RoomService.createRoom({
    name,
    floorNo,
    roomNo,
    capacity,
    pricePerSlot,
    amenities,
    images,
    isDeleted: false,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Room added successfully',
    data: newRoom,
  });
});

const getSingleRoom = catchAsync(async (req, res) => {
  const roomId = req.params.id;
  const room = await RoomService.getRoomById(roomId);

  if (!room) {
    return noDataFound(res);
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Room retrieved successfully',
    data: room,
  });
});

const getAllRoom = catchAsync(async (req, res) => {
  const rooms = await RoomService.getAllRooms(req.query);

  if (rooms.result.length === 0) {
    return noDataFound(res);
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rooms retrieved successfully',
    data: rooms,
  });
});

const updatedRoom = catchAsync(async (req, res) => {
  const roomId = new Types.ObjectId(req.params.id);
  const { roomNo, floorNo, ...updatedRoomData } = req.body;

  // Validation for roomNo based on floorNo (if provided)
  if (roomNo && floorNo) {
    const roomNoPattern = floorNo * 100 + 100; // Base starting room number for the floor
    const roomNoStart = roomNoPattern + 1; // Start of the valid room number range for the floor
    const roomNoEnd = roomNoPattern + 100; // End of the valid room number range for the floor

    if (roomNo < roomNoStart || roomNo > roomNoEnd) {
      return sendResponse(res, {
        success: false,
        statusCode: httpStatus.BAD_REQUEST,
        message: `Invalid room no.!! For floor no: ${floorNo}, room no should be between ${roomNoStart} and ${roomNoEnd}.`,
      });
    }
  }

  // Proceed with updating the room
  const updatedRoom = await RoomService.updateRoom(roomId, {
    ...updatedRoomData,
    roomNo,
    floorNo,
  });

  if (!updatedRoom) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.NOT_FOUND,
      message: 'Room not found.!',
    });
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Room updated successfully',
    data: updatedRoom,
  });
});


const deleteRoom = catchAsync(async (req, res) => {
  const roomId = req.params.id;

  // Check if the room exists
  const isRoomExists = await RoomService.getRoomById(roomId);

  if (!isRoomExists) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.NOT_FOUND,
      message: 'Room not found',
    });
  }

  // const chechBookedRoom = await Booking.findById(roomId);
  // if (chechBookedRoom) {
  //   throw new AppError(httpStatus.FORBIDDEN, "Booked room won't be deleted !");
  // }

  const deletedRoom = await RoomService.deleteRoom(roomId);

  // if (!deleteRoom) {
  //   return sendResponse(res, {
  //     success: false,
  //     statusCode: httpStatus.NOT_FOUND,
  //     message: 'Failed to delete room',
  //   });
  // }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Room deleted successfully',
    data: deletedRoom,
  });
});

export const RoomController = {
  createRoom,
  getSingleRoom,
  getAllRoom,
  updatedRoom,
  deleteRoom,
};
