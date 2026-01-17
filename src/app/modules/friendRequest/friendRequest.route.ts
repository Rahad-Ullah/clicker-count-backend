import express from 'express';
import { FriendRequestController } from './friendRequest.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { FriendRequestValidations } from './friendRequest.validation';

const router = express.Router();

// create friend request
router.post(
  '/create',
  auth(USER_ROLES.USER, USER_ROLES.ADVERTISER),
  validateRequest(FriendRequestValidations.createFriendRequestValidation),
  FriendRequestController.createFriendRequest
);

export const friendRequestRoutes = router;
