import express from 'express';
import { JoinRequestController } from './joinRequest.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { JoinRequestValidations } from './joinRequest.validation';

const router = express.Router();

// create join request
router.post(
  '/create',
  auth(USER_ROLES.USER, USER_ROLES.ADVERTISER),
  validateRequest(JoinRequestValidations.createJoinRequest),
  JoinRequestController.createJoinRequest,
);

// update join request
router.patch(
  '/update/:id',
  auth(USER_ROLES.USER, USER_ROLES.ADVERTISER),
  validateRequest(JoinRequestValidations.updateJoinRequest),
  JoinRequestController.updateJoinRequest,
);

export const joinRequestRoutes = router;
