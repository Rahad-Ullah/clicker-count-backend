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

// get single post
router.get('/single/:id', auth(), PostController.getSinglePostById);

// get posts by user id
router.get('/user/:id', auth(), PostController.getPostsByUserId);

// get my posts
router.get(
  '/my-posts',
  auth(USER_ROLES.USER, USER_ROLES.ADVERTISER),
  PostController.getMyPosts
);

// get all posts
router.get(
  '/',
  auth(),
  PostController.getAllPosts
);

export const postRoutes = router;