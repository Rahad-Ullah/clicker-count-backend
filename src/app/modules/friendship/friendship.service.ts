import QueryBuilder from '../../builder/QueryBuilder';
import { Friendship } from './friendship.model';

// --------------- get friends by user id ---------------
const getFriendsByUserId = async (
  userId: string,
  query: Record<string, unknown>
) => {
  const friendQuery = new QueryBuilder(
    Friendship.find({ user: userId, isDeleted: false }),
    query
  )
    .paginate()
    .sort()
    .fields();

  const [data, pagination] = await Promise.all([
    friendQuery.modelQuery.lean(),
    friendQuery.getPaginationInfo(),
  ]);

  return { data, pagination };
};

export const FriendshipServices = {
  getFriendsByUserId,
};
