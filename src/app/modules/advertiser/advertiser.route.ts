import express from 'express';
import { AdvertiserController } from './advertiser.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { AdvertiserValidations } from './advertiser.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

// create advertiser
router.post(
  '/create',
  auth(USER_ROLES.USER),
  fileUploadHandler(),
  validateRequest(AdvertiserValidations.createAdvertiserValidation),
  AdvertiserController.createAdvertiser,
);

export const advertiserRoutes = router;
