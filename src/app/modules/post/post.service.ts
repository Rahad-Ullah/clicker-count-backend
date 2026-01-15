import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { IPost } from './post.interface';
import { Post } from './post.model';
import unlinkFile from '../../../shared/unlinkFile';

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

// -------------- update post --------------
const updatePostToDB = async (
  id: string,
  payload: Partial<IPost> & { newImages?: string[]; removedImages?: string[] }
): Promise<IPost> => {
  // check if post exists
  const existingPost = await Post.findById(id).lean();
  if (!existingPost) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Post not found');
  }

  payload.photos = existingPost.photos || [];

  // remove old photos and unlink
  if (payload?.removedImages && payload.removedImages.length > 0) {
    const deletedPhotos = existingPost.photos.filter(photo =>
      payload.removedImages?.includes(photo)
    );
    deletedPhotos.forEach(photo => unlinkFile(photo));
    payload.photos = existingPost.photos.filter(
      photo => !payload.removedImages?.includes(photo)
    );
  }

  // attach new photos
  if (payload?.newImages && payload.newImages.length > 0) {
    payload.photos = [...payload.photos, ...payload.newImages];
  }

  const result = await Post.findByIdAndUpdate(id, payload, { new: true });

  return result!;
};

// -------------- get single post --------------
const getSinglePostFromDB = async (id: string): Promise<IPost> => {
  const result = await Post.findById(id)
    .populate('user', 'name email image')
    .lean();
  return result!;
};

export const PostServices = {
  createPostToDB,
  updatePostToDB,
  getSinglePostFromDB,
};
