import { Types } from 'mongoose';
import { IRoom } from './room.interface';
import { Room } from './room.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { roomSearchableFields } from './room.constant';
import { Booking } from '../Booking/booking.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';

const createRoom = async (data: IRoom): Promise<IRoom> => {
  const newRoom = new Room({
    ...data,
    isDeleted: false,
  });
  await newRoom.save();
  return newRoom;
};

const getRoomById = async (id: string): Promise<IRoom | null> => {
  // return await Room.findById(id).select('-__v');
  return await Room.findById(id);
};

const getAllRooms = async (query: Record<string, unknown>) => {
  const roomQuery = new QueryBuilder(Room.find({ isDeleted: false }), query)
    .search(roomSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();
  const result = await roomQuery.modelQuery;
  const meta = await roomQuery.countTotal();
  return {
    result,
    meta,
  };
};

const updateRoom = async (
  id: Types.ObjectId,
  data: Partial<IRoom>,
): Promise<IRoom | null> => {
  const updatedRoom = await Room.findByIdAndUpdate(id, data, { new: true });
  return updatedRoom;
};

const deleteRoom = async (id: string): Promise<IRoom | null> => {
  const checkBookedRoom = await Booking.find({ room: id, isConfirmed: 'confirmed' });
  
  if (checkBookedRoom.length > 0) {
    throw new AppError(httpStatus.FORBIDDEN, "Booked room won't be deleted!");
  }

  const deletedRoom = await Room.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  return deletedRoom;
};

export const RoomService = {
  createRoom,
  getRoomById,
  getAllRooms,
  updateRoom,
  deleteRoom,
};
