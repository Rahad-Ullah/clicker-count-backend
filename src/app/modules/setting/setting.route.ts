import express from 'express';
import { SettingController } from './setting.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { SettingValidations } from './setting.validation';

const router = express.Router();

// update setting
router.patch(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(SettingValidations.settingValidation),
  SettingController.updateSetting,
);

export const settingRoutes = router;
