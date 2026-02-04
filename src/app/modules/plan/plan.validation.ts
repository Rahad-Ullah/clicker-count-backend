import { z } from 'zod';
import { PLAN_NAME } from './plan.constants';

export const createPlanValidation = z.object({
  body: z
    .object({
      name: z.nativeEnum(PLAN_NAME),
      price: z.number().positive('Price must be greater than 0'),
    })
    .strict(),
});

export const PlanValidations = {
  createPlanValidation,
};
