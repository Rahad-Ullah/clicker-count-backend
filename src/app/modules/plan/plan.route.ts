import express from 'express';
import { PlanController } from './plan.controller';

const router = express.Router();

router.get('/', PlanController);

export const planRoutes = router;