import express from 'express';
import { FriendRequestController } from './friendRequest.controller';

const router = express.Router();

router.get('/', FriendRequestController);

export const friendRequestRoutes = router;