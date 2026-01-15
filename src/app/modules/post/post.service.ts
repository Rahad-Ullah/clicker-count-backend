import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { IPost } from './post.interface';
import { Post } from './post.model';

// -------------- create post --------------
const createPostToDB = async (payload: IPost): Promise<IPost> => {
  // check if photos provided
  if (!payload.photos || payload.photos.length === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Photos are required');
  }

  // get user
  const user = await User.findById(payload.user).lean();
  if (!user) throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");

  // inherit address and location from user
  payload.address = user.address;
  payload.location = user.location;

  const result = await Post.create(payload);
  return result;
};

export const PostServices = {
  createPostToDB,
};
