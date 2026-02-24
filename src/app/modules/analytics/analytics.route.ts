import express from 'express';
import { AnalyticsController } from './analytics.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';

const router = express.Router();

// get overview
router.get(
  '/overview',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  AnalyticsController.getOverview
);

// get monthly user growth
router.get(
  '/user-growth',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  AnalyticsController.getMonthlyUserGrowth
);

// get monthly earnings growth
router.get(
  '/earning-growth',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  AnalyticsController.getEarningGrowth
);

export const analyticsRoutes = router;
