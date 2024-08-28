// import jwt from 'jsonwebtoken';
// import config from '../config';

// export const generateToken = (email: string, role: string) => {
//   return jwt.sign({ email, role }, config.jwt_access_secret as string, {
//     expiresIn: config.jwt_access_expires_in,
//   });
// };

// export const generateRefreshToken = (email: string, role: string) => {
//   return jwt.sign({ email, role }, config.jwt_refresh_secret as string, {
//     expiresIn: config.jwt_refresh_expires_in,
//   });
// };