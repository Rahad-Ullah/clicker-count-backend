import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { IPost } from './post.interface';
import { Post } from './post.model';
import unlinkFile from '../../../shared/unlinkFile';
import QueryBuilder from '../../builder/QueryBuilder';
import { FriendshipServices } from '../friendship/friendship.service';
import { POST_PRIVACY } from './post.constants';

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
  payload: Partial<IPost> & { newImages?: string[]; removedImages?: string[] },
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
      payload.removedImages?.includes(photo),
    );
    deletedPhotos.forEach(photo => unlinkFile(photo));
    payload.photos = existingPost.photos.filter(
      photo => !payload.removedImages?.includes(photo),
    );
  }

  // attach new photos
  if (payload?.newImages && payload.newImages.length > 0) {
    payload.photos = [...payload.photos, ...payload.newImages];
  }

  const result = await Post.findByIdAndUpdate(id, payload, { new: true });

  return result!;
};

// -------------- delete post --------------
const deletePostFromDB = async (id: string, user: string): Promise<IPost> => {
  // check if post exists
  const existingPost = await Post.findById(id).lean();
  if (!existingPost) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Post not found');
  }

  // check if user is owner
  if (existingPost.user.toString() !== user) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      'You are not authorized to perform this action',
    );
  }

  const result = await Post.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  return result!;
};

// -------------- get single post --------------
const getSinglePostFromDB = async (id: string): Promise<IPost> => {
  const result = await Post.findById(id)
    .populate('user', 'name email image')
    .lean();
  return result!;
};

// -------------- get by user id --------------
const getPostsByUserId = async (
  userId: string,
  currentUserId: string,
  query: Record<string, unknown>,
) => {
  const filter = {
    user: userId,
    isDeleted: false,
  } as any;
  // check friendship status
  const { isAlreadyFriend } = await FriendshipServices.checkFriendship(
    currentUserId,
    userId,
  );

  if (isAlreadyFriend) {
    filter.privacy = { $ne: POST_PRIVACY.ONLY_ME };
  } else {
    filter.privacy = POST_PRIVACY.PUBLIC;
  }

  const postQuery = new QueryBuilder(
    Post.find(filter).populate('user', 'name email image'),
    query,
  )
    .filter()
    .paginate()
    .sort()
    .fields();

  const [posts, pagination] = await Promise.all([
    postQuery.modelQuery.lean(),
    postQuery.getPaginationInfo(),
  ]);
  return { posts, pagination };
};

// -------------- get by user id --------------
const getMyPosts = async (userId: string, query: Record<string, unknown>) => {
  const postQuery = new QueryBuilder(
    Post.find({ user: userId, isDeleted: false }).populate(
      'user',
      'name email image',
    ),
    query,
  )
    .filter()
    .paginate()
    .sort()
    .fields();

  const [posts, pagination] = await Promise.all([
    postQuery.modelQuery.lean(),
    postQuery.getPaginationInfo(),
  ]);
  return { posts, pagination };
};

// -------------- get all posts --------------
const getAllPostsFromDB = async (query: Record<string, unknown>) => {
  const filter: Record<string, any> = {
    isDeleted: false,
  };
  // Nearby search (lat, lng, radius)
  if (query.lat && query.lng) {
    const lat = parseFloat(query.lat as string);
    const lng = parseFloat(query.lng as string);
    const radiusKm = parseFloat((query.radius as string) || '50'); // radius in kilometers, default to 5km

    if (!isNaN(lat) && !isNaN(lng) && !isNaN(radiusKm) && radiusKm > 0) {
      const EARTH_RADIUS_KM = 6378.1;
      const radiusInRadians = radiusKm / EARTH_RADIUS_KM;

      filter.location = {
        $geoWithin: {
          $centerSphere: [[lng, lat], radiusInRadians],
        },
      };
    }
  }
  // Date filter
  if (query.startDate && query.endDate) {
    filter.createdAt = {
      $gte: new Date(query.startDate as string),
      $lte: new Date(query.endDate as string) || new Date(),
    };
  }

  const postQuery = new QueryBuilder(
    Post.find(filter).populate('user', 'name email image').lean(),
    query,
  )
    .search(['address'])
    .filter(['location', 'lat', 'lng', 'radius', 'startDate', 'endDate'])
    .sort()
    .fields()
    .paginate();

  const [data, pagination] = await Promise.all([
    postQuery.modelQuery.lean(),
    postQuery.getPaginationInfo(),
  ]);

  return { data, pagination };
};

export const PostServices = {
  createPostToDB,
  updatePostToDB,
  deletePostFromDB,
  getSinglePostFromDB,
  getPostsByUserId,
  getMyPosts,
  getAllPostsFromDB,
};
