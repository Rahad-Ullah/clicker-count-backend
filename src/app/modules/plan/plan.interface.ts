import { Model, Types } from 'mongoose';
import { PLAN_NAME } from './plan.constants';

export interface IPlan {
  _id: Types.ObjectId;
  name: PLAN_NAME;
  price: number;
  stripeProductId: string;
  stripePriceId: string;
  isDeleted: boolean;
}

export type PlanModel = Model<IPlan>;
