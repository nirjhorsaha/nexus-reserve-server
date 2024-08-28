import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import { UserService } from './user.service';
import catchAsync from '../../utils/catchAsync';
import noDataFound from '../../middlewares/noDataFound';

const userSignUp = catchAsync(async (req, res) => {
  const user = await UserService.createUser(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User registered successfully',
    data: user,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const users = await UserService.getAllUsers();

  if (users.length === 0) {
    return noDataFound(res);
  }
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users retrieved successfully',
    data: users,
  });
});

export const UserController = {
  userSignUp,
  getAllUsers,
};
