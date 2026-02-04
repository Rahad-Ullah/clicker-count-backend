import express from 'express';
import { PlanController } from './plan.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { PlanValidations } from './plan.validation';

const router = express.Router();

// create plan
router.post(
  '/create',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(PlanValidations.createPlanSchema),
  PlanController.createPlan,
);

// delete plan
router.delete(
  '/delete/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  PlanController.deletePlan,
);

export const planRoutes = router;
