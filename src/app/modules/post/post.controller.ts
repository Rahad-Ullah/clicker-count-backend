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

export const PostController = {
  createPost,
};
