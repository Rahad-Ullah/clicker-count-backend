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

// verify advertiser
router.post(
  '/verify',
  validateRequest(AdvertiserValidations.verifyAdvertiserValidation),
  AdvertiserController.verifyAdvertiser,
);

// update advertiser
router.patch(
  '/update/me',
  auth(USER_ROLES.USER),
  fileUploadHandler(),
  validateRequest(AdvertiserValidations.updateAdvertiserValidation),
  AdvertiserController.updateAdvertiserByUserId,
);

// get advertiser by user id
router.get(
  '/user/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  AdvertiserController.getAdvertiserByUserId,
);
 
// get my advertiser profile
router.get(
  '/me',
  auth(USER_ROLES.USER),
  AdvertiserController.getMyAdvertiserProfile,
);

// get all advertisers
router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  AdvertiserController.getAllAdvertisers,
);

export const advertiserRoutes = router;
