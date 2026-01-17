import express from 'express';
import { FriendshipController } from './friendship.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';

const router = express.Router();

// unfriend or delete friendship
router.delete(
    '/:id',
    auth(USER_ROLES.USER, USER_ROLES.ADVERTISER),
    FriendshipController.unfriend
);

// get my friends
router.get(
  '/my-friends',
  auth(USER_ROLES.USER, USER_ROLES.ADVERTISER),
  FriendshipController.getMyFriends
);

export const friendshipRoutes = router;