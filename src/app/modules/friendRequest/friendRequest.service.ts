import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { IFriendRequest } from './friendRequest.interface';
import { FriendRequest } from './friendRequest.model';
import { FRIEND_REQUEST_STATUS } from './friendRequest.constants';
import { Friendship } from '../friendship/friendship.model';
import QueryBuilder from '../../builder/QueryBuilder';
import mongoose from 'mongoose';

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

// ------------- update friend request -------------

const updateFriendRequest = async (
  id: string,
  payload: Partial<IFriendRequest>
): Promise<IFriendRequest> => {
  const session = await mongoose.startSession();

  try {
    let updatedRequest: IFriendRequest | null = null;

    await session.withTransaction(async () => {
      // 1. Check if friend request exists
      const existingRequest = await FriendRequest.findById(id).session(session);

      if (!existingRequest) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Friend request not found');
      }

      // 2. If accepted, create friendship if not exists
      if (payload.status === FRIEND_REQUEST_STATUS.ACCEPTED) {
        const existingFriendship = await Friendship.findOne({
          $or: [
            { user: existingRequest.sender, friend: existingRequest.receiver },
            { user: existingRequest.receiver, friend: existingRequest.sender },
          ],
        }).session(session);

        if (!existingFriendship) {
          await Friendship.create(
            [
              {
                user: existingRequest.sender,
                friend: existingRequest.receiver,
              },
            ],
            { session }
          );
        }
      }

      // 3. Update friend request status
      updatedRequest = await FriendRequest.findByIdAndUpdate(id, payload, {
        new: true,
        session,
      });
    });

    return updatedRequest!;
  } catch (error) {
    throw error;
  } finally {
    session.endSession();
  }
};

// ------------- get friend requests by user id -------------
const getFriendRequestsByUserId = async (
  userId: string,
  query: Record<string, unknown> = { status: FRIEND_REQUEST_STATUS.PENDING }
) => {
  const requestQuery = new QueryBuilder(
    FriendRequest.find({
      receiver: userId,
    }).populate('sender', 'name image'),
    query
  )
    .filter()
    .paginate()
    .sort()
    .fields();

  const [data, pagination] = await Promise.all([
    requestQuery.modelQuery.lean(),
    requestQuery.getPaginationInfo(),
  ]);
  return { data, pagination };
};

export const FriendRequestServices = {
  createFriendRequest,
  updateFriendRequest,
  getFriendRequestsByUserId,
};
