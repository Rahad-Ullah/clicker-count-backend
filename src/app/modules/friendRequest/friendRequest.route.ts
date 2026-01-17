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

// update friend request
router.patch(
  '/update/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADVERTISER),
  validateRequest(FriendRequestValidations.updateFriendRequestValidation),
  FriendRequestController.updateFriendRequest
);

// get friend requests
router.get(
  '/my-requests',
  auth(USER_ROLES.USER, USER_ROLES.ADVERTISER),
  FriendRequestController.getMyFriendRequests
);

export const friendRequestRoutes = router;
