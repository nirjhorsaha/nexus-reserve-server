import httpStatus from 'http-status';
import sendResponse from '../utils/sendResponse';
import { Response } from 'express';

const noDataFound = (res: Response,) => {
  sendResponse(res, {
    success: false,
    statusCode : httpStatus.NOT_FOUND,
    message : 'No Data Found',
    data: [],
  });
};

export default noDataFound;