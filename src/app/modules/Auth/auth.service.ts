import bcrypt from 'bcrypt';
import { User } from '../User/user.model';

const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    return null;
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    return null;
  }

  return user;
};

export const authService = {
  loginUser,
};
