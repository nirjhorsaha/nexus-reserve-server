import { RoomService } from './room.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';

const createRoom = catchAsync(async (req, res) => {
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

// const getSingleRoom = catchAsync(async (req, res) => {
//   const roomId = req.params.id;
//   const room = await RoomService.getRoomById(roomId);

//   if (!room) {
//     return sendResponse(res, {
//       success: false,
//       statusCode: httpStatus.NOT_FOUND,
//       message: 'Room not found',
//       data: null,
//     });
//   }

//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: 'Room retrieved successfully',
//     data: room,
//   });
// });

const getAllRoom = catchAsync(async (req, res) => {
  const rooms = await RoomService.getAllRooms();

   if (rooms.length === 0) {
     return sendResponse(res, {
       statusCode: httpStatus.NOT_FOUND,
       success: false,
       message: 'No Data Found',
       data: [],
     });
  }
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rooms retrieved successfully',
    data: rooms,
  });
});

export const RoomController = {
  createRoom,
  getSingleRoom,
  getAllRoom,
};
