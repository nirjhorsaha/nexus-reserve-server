import { Types } from 'mongoose';
import { IRoom } from './room.interface';
import { Room } from './room.model';

const createRoom = async (data: IRoom): Promise<IRoom> => {
  const newRoom = new Room({
    name: data.name,
    roomNo: data.roomNo,
    floorNo: data.floorNo,
    capacity: data.capacity,
    pricePerSlot: data.pricePerSlot,
    amenities: data.amenities,
    isDeleted: false,
  });
  await newRoom.save();
  return newRoom;
};

const getRoomById = async (id: string): Promise<IRoom | null> => {
  // return await Room.findById(id).select('-__v');
  return await Room.findById(id);
};

const getAllRooms = async () => {
  // return await Room.find({ isDeleted: false });
  return await Room.find();
};

const updateRoom = async (
  id: Types.ObjectId,
  data: Partial<IRoom>,
): Promise<IRoom | null> => {
  const updatedRoom = await Room.findByIdAndUpdate(id, data, { new: true });
  return updatedRoom;
};

const deleteRoom = async (id: string): Promise<IRoom | null> => {
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
