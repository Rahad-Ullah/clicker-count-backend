import { Request, Response, NextFunction } from 'express';
import { JoinRequestServices } from './joinRequest.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// create join request
const createJoinRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await JoinRequestServices.createJoinRequestIntoDB({
      ...req.body,
      user: req.user.id,
    });

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Join request created successfully',
      data: result,
    });
  },
);

export const JoinRequestController = {
  createJoinRequest,
};