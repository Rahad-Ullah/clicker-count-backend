import express from 'express';
import { AdvertisementController } from './advertisement.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { AdvertisementValidations } from './advertisement.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

// create advertisement
router.post(
  '/create',
  auth(USER_ROLES.ADVERTISER),
  fileUploadHandler(),
  validateRequest(AdvertisementValidations.createAdvertisementValidation),
  AdvertisementController.createAdvertisement,
);

// update advertisement
router.patch(
  '/update/:id',
  auth(USER_ROLES.ADVERTISER),
  fileUploadHandler(),
  validateRequest(AdvertisementValidations.updateAdvertisementValidation),
  AdvertisementController.updateAdvertisement,
);

// update advertisement approval status
router.patch(
  '/update-approval-status/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(AdvertisementValidations.updateAdvertisementStatusValidation),
  AdvertisementController.updateAdvertisementStatus,
);

// delete advertisement
router.delete(
  '/delete/:id',
  auth(USER_ROLES.ADVERTISER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(AdvertisementValidations.deleteAdvertisementValidation),
  AdvertisementController.deleteAdvertisement,
);

// get my advertisements
router.get(
  '/me',
  auth(USER_ROLES.ADVERTISER),
  AdvertisementController.getMyAdvertisements,
);

// get single advertisement
router.get(
  '/single/:id',
  auth(),
  AdvertisementController.getSingleAdvertisementById,
);

// get all advertisements
router.get('/all', auth(), AdvertisementController.getAllAdvertisements);

// get nearby active ads
router.get(
  '/nearby-active',
  validateRequest(AdvertisementValidations.getNearbyActiveAds),
  AdvertisementController.getNearbyActiveAds,
);

// track ad click
router.post(
  '/track-click/:id',
  validateRequest(AdvertisementValidations.trackAdClick),
  AdvertisementController.trackAdClick,
);

// get my advertisement overview
router.get(
  '/overview/me',
  auth(USER_ROLES.ADVERTISER),
  AdvertisementController.getMyAdvertisementOverview,
);

export const advertisementRoutes = router;
