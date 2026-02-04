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

export const advertisementRoutes = router;
