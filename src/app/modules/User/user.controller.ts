import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import { userService } from "./user.service";
import catchAsync from "../../utils/catchAsync";

const userSignUp = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User registered successfully',
    data: user
  });
});
export const userController = {
    userSignUp
}