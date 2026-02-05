import { Request, Response } from 'express';
import { PostServices } from './post.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getMultipleFilesPath } from '../../../shared/getFilePath';

// -------------- create post --------------
const createPost = catchAsync(async (req: Request, res: Response) => {
  const images = getMultipleFilesPath(req.files, 'image');
  const result = await PostServices.createPostToDB({
    ...req.body,
    user: req.user?.id,
    photos: images,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Post created successfully',
    data: result,
  });
});

// -------------- update post --------------
const updatePost = catchAsync(async (req: Request, res: Response) => {
  const images = getMultipleFilesPath(req.files, 'image');
    const payload = {
    ...req.body,
    removedImages: JSON.parse(req.body.removedImages || '[]'),
  };
  if (images && images.length > 0) {
    payload.newImages = images;
  }

  const result = await PostServices.updatePostToDB(req.params.id, payload);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Post updated successfully',
    data: result,
  });
});

// ------------- delete post -------------
const deletePost = catchAsync(async (req: Request, res: Response) => {
  const result = await PostServices.deletePostFromDB(req.params.id, req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Post deleted successfully',
    data: result,
  });
});

// ------------- get single by id -------------
const getSinglePostById = catchAsync(async (req: Request, res: Response) => {
  const result = await PostServices.getSinglePostFromDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Post retrieved successfully',
    data: result,
  });
});

// ------------- get posts by user id -------------
const getPostsByUserId = catchAsync(async (req: Request, res: Response) => {
  const result = await PostServices.getPostsByUserId(
    req.params.id,
    req.user?.id,
    req.query,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Posts retrieved successfully',
    data: result.posts,
    pagination: result.pagination,
  });
});

// ------------ get my posts ------------
const getMyPosts = catchAsync(async (req: Request, res: Response) => {
  const result = await PostServices.getMyPosts(req.user?.id, req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Posts retrieved successfully',
    data: result.posts,
    pagination: result.pagination,
  });
});

// ------------ get all posts ------------
const getAllPosts = catchAsync(async (req: Request, res: Response) => {
  const result = await PostServices.getAllPostsFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Posts retrieved successfully',
    data: result.data,
    pagination: result.pagination,
  });
});

export const PostController = {
  createPost,
  updatePost,
  deletePost,
  getSinglePostById,
  getPostsByUserId,
  getMyPosts,
  getAllPosts,
};
