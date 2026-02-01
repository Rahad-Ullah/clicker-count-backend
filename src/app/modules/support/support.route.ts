import express from 'express';
import { SupportController } from './support.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { SupportValidations } from './support.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

// create support
router.post(
  '/create',
  auth(USER_ROLES.USER),
  fileUploadHandler(),
  validateRequest(SupportValidations.createSupportSchema),
  SupportController.createSupport,
);

// update support
router.patch(
  '/update/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  validateRequest(SupportValidations.updateSupportSchema),
  SupportController.updateSupport,
);

// get all support
router.get('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), SupportController.getAllSupport);

export const supportRoutes = router;