import { IUser } from './user.interface';
import { User } from './user.model';

const createUser = async (userData: Partial<IUser>) => {
  const user = new User(userData);
  await user.save();
  return user;
};

export const userService = {
  createUser,
};
