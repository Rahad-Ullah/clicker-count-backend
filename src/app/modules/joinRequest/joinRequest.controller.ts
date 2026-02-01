import { Request, Response, NextFunction } from 'express';
import { JoinRequestServices } from './joinRequest.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// create join request
const createJoinRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await JoinRequestServices.createJoinRequestIntoDB({
    ...req.body,
    user: req.user.id,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: (result as any)?.message || 'Join request created successfully',
    data: result,
  });
});

// update join request
const updateJoinRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await JoinRequestServices.updateJoinRequestIntoDB(
    req.params.id,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Join request updated successfully',
    data: result,
  });
});

// get pending requests
const getPendingRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await JoinRequestServices.getPendingRequestByChatId(
    req.params.id,
    req.query
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Join request fetched successfully',
    data: result,
  });
});

export const JoinRequestController = {
  createJoinRequest,
  updateJoinRequest,
  getPendingRequests,
};