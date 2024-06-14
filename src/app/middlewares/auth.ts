import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';

const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: 'Authorization token missing',
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwt_access_secret as string) as {
      sub: string;
    };

    // Attach user id to request object
    (req as any).userId = decoded.sub;
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
