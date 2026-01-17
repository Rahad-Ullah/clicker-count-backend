import { Request, Response } from 'express';
import { FriendshipServices } from './friendship.service';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { StatusCodes } from 'http-status-codes';

// unfriend or delete friendship
const unfriend = catchAsync(async (req: Request, res: Response) => {
  const result = await FriendshipServices.unfriend(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Friendship deleted successfully',
    data: result,
  });
});

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
  unfriend,
  getMyFriends,
};
