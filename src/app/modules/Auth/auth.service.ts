import { User } from '../User/user.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { TLoginUser } from './auth.interface';
import config from '../../config';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { createToken } from './auth.utils';

const loginUser = async (payload: TLoginUser) => {
  // const user = await User.findOne({ email: payload?.email });
  const user = await User.findUserByEmail(payload.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }

  if (!(await User.isPasswordMatched(payload?.password, user?.password)))
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched');

  const jwtPayload = {
    // userId: user.id,
    email: user.email,
    role: user.role,
  };

  // Generate JWT token
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  return {
    user,
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string) => {
  // checking if the given token is valid
  const decoded = jwt.verify(
    token,
    config.jwt_refresh_secret as string,
  ) as JwtPayload;

  const { email } = decoded;

  // checking if the user is exist
  const user = await User.findUserByEmail(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }

  const jwtPayload = {
    email: user.email,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return {
    accessToken,
  };
};

export const AuthService = {
  loginUser,
  refreshToken,
};

// const loginUser = async (email: string, password: string) => {
//   const user = await User.findOne({ email });

//   if (!user) {
//     throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
//   }

//   const isPasswordMatch = await bcrypt.compare(password, user.password);

//   if (!isPasswordMatch) {
//     throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid Password!');
//   }
//   return user;
// }
