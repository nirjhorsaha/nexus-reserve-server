import { Request, Response } from 'express';
import { authService } from './auth.service';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import generateToken from '../../utils/jwt';

const userlogin = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate user credentials
  const user = await authService.loginUser(email, password);

  if (!user) {
    sendResponse(res, {
      success: false,
      statusCode: httpStatus.UNAUTHORIZED,
      message: 'Invalid email or password',
      data: null,
    });
    return;
  }

// Generate JWT token
  const token = generateToken(user?.email, user?.role);

  // Return success response with token and user data
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User logged in successfully',
    token: token,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      address: user.address,
    },
  });
});

export const authController = {
  userlogin,
};
