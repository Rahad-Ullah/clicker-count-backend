import express from 'express';
import { PostController } from './post.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { PostValidations } from './post.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

// create post
router.post(
  '/create',
  auth(USER_ROLES.USER, USER_ROLES.ADVERTISER),
  fileUploadHandler(),
  validateRequest(PostValidations.createPostValidation),
  PostController.createPost
);

// update post
router.patch(
  '/update/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADVERTISER),
  fileUploadHandler(),
  validateRequest(PostValidations.updatePostValidation),
  PostController.updatePost
);

export const postRoutes = router;