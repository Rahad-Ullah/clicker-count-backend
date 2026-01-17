import { Request, Response } from 'express';
import { FriendRequestServices } from './friendRequest.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';

// create friend request
const createFriendRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await FriendRequestServices.createFriendRequest({
    ...req.body,
    sender: req.user?.id,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Friend request created successfully',
    data: result,
  });
});

// get my friend requests
const getMyFriendRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await FriendRequestServices.getFriendRequestsByUserId(
    req.user?.id,
    req.query
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Friend requests retrieved successfully',
    data: result.data,
    pagination: result.pagination,
  });
});

export const FriendRequestController = {
  createFriendRequest,
  getMyFriendRequests,
};
