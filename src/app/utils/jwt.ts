import jwt from 'jsonwebtoken';
import config from '../config';

const generateToken = (email: string, role: string) => {
  return jwt.sign({ email, role }, config.jwt_access_secret as string, {
    expiresIn: config.jwt_access_expires_in,
  });
};

export default generateToken;
