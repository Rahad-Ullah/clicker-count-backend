import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { Friendship } from './friendship.model';
import { FriendRequest } from '../friendRequest/friendRequest.model';
import { FRIEND_REQUEST_STATUS } from '../friendRequest/friendRequest.constants';
import { User } from '../user/user.model';

// --------------- unfriend or delete friendship ---------------
const unfriend = async (friendshipId: string) => {
  // check if friendship exists
  const existingFriendship = await Friendship.findById(friendshipId);
  if (!existingFriendship) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Friendship not found');
  }

  const result = await Friendship.findByIdAndDelete(friendshipId);
  return result;
};

// --------------- check friendship by user id ---------------
const checkFriendship = async (userId: string, friendUserId: string) => {
  // check if friend exists
  const friend = await User.exists({ _id: friendUserId });
  if (!friend) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Friend does not exist');
  }
  
  const [existingFriendship, pendingFriendRequest] = await Promise.all([
    Friendship.exists({
      $or: [
        { user: userId, friend: friendUserId },
        { user: friendUserId, friend: userId },
      ],
    }),
    FriendRequest.findOne({
      sender: userId,
      receiver: friendUserId,
      status: FRIEND_REQUEST_STATUS.PENDING,
    }),
  ]);

  return { isAlreadyFriend: !!existingFriendship, pendingFriendRequest };
};

// --------------- get friends by user id ---------------
const getFriendsByUserId = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const friendQuery = new QueryBuilder(
    Friendship.find({
      $or: [{ user: userId }, { friend: userId }],
    })
      .populate('user', 'name email image')
      .populate('friend', 'name email image'),
    query,
  )
    .paginate()
    .sort()
    .fields();

  const [data, pagination] = await Promise.all([
    friendQuery.modelQuery.lean(),
    friendQuery.getPaginationInfo(),
  ]);

  const formattedData = data.map((friendship: any) => {
    const isUser = friendship.user._id.toString() === userId;

    return {
      _id: friendship._id,
      friend: isUser ? friendship.friend : friendship.user,
      createdAt: friendship.createdAt,
      updatedAt: friendship.updatedAt,
    };
  });

  return { data: formattedData, pagination };
};

export const FriendshipServices = {
  unfriend,
  checkFriendship,
  getFriendsByUserId,
};
