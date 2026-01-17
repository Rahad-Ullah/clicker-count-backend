import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { IFriendRequest } from './friendRequest.interface';
import { FriendRequest } from './friendRequest.model';
import { FRIEND_REQUEST_STATUS } from './friendRequest.constants';
import { Friendship } from '../friendship/friendship.model';

// --------------- create friend request ---------------
const createFriendRequest = async (
  payload: IFriendRequest
): Promise<IFriendRequest> => {
  // check if the receiver exists
  const existingReceiver = await User.exists({ _id: payload.receiver });
  if (!existingReceiver) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Receiver does not exist');
  }

  // check if they are already friends
  const existingFriendship = await Friendship.exists({
    $or: [
      { user: payload.sender, friend: payload.receiver },
      { user: payload.receiver, friend: payload.sender },
    ],
  });
  if (existingFriendship) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You are already friends with this user'
    );
  }

  // check if already sent a friend request
  const existingRequest = await FriendRequest.exists({
    sender: payload.sender,
    receiver: payload.receiver,
    status: FRIEND_REQUEST_STATUS.PENDING,
  });
  if (existingRequest) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You have a pending friend request to this user'
    );
  }

  const result = await FriendRequest.create(payload);
  return result;
};

export const FriendRequestServices = {
  createFriendRequest,
};
