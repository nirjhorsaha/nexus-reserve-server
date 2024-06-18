import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import sendResponse from '../utils/sendResponse';
import httpStatus from 'http-status';

const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // checking if the token is missing
  if (!token) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: 'Authorization token missing',
      data: null,
    });
  }

  try {
    // checking if the given token is valid
    const decoded = jwt.verify(
      token,
      config.jwt_access_secret as string,
    ) as JwtPayload;

    // Attach user id and role to request object
    (req as any).userId = decoded.sub;
    (req as any).userRole = decoded.role;
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      statusCode: 403,
      message: 'Invalid token',
    });
  }
};

const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      statusCode: 403,
      message: 'Access denied. Admins only.',
    });
  }
  next();
};

export { authenticateUser, authorizeAdmin };
