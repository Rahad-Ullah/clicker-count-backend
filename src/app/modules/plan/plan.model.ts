import { Schema, model } from 'mongoose';
import { IPlan, PlanModel } from './plan.interface';
import { PLAN_NAME } from './plan.constants';

const planSchema = new Schema<IPlan, PlanModel>(
  {
    name: {
      type: String,
      enum: Object.values(PLAN_NAME),
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stripeProductId: {
      type: String,
      required: true,
    },
    stripePriceId: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const Plan = model<IPlan, PlanModel>('Plan', planSchema);
