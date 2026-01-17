import { Request, Response, NextFunction } from 'express';
import { FriendshipServices } from './friendship.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { StatusCodes } from 'http-status-codes';

// get my friends
const getMyFriends = catchAsync(async (req: Request, res: Response) => {
  const result = await FriendshipServices.getFriendsByUserId(
    req.user?.id,
    req.query
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Friends retrieved successfully',
    data: result.data,
    pagination: result.pagination,
  });
});

export const FriendshipController = {
  getMyFriends,
};