import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { IPlan } from './plan.interface';
import { Plan } from './plan.model';
import { stripe } from '../../../config/stripe';
import mongoose from 'mongoose';

// -------------- create plan --------------
const createPlanIntoDB = async (payload: IPlan) => {
  const session = await mongoose.startSession();

  let stripeProductId: string | null = null;
  let stripePriceId: string | null = null;

  try {
    session.startTransaction();

    // 1️. Check if plan exists (transactional)
    const existingPlan = await Plan.findOne(
      { name: payload.name },
      null,
      { session }
    );

    if (existingPlan) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Plan already exists');
    }

    // 2️. Create Stripe Product
    const product = await stripe.products.create({
      name: payload.name,
      type: 'service',
    });
    stripeProductId = product.id;

    // 3️. Create Stripe Price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: payload.price * 100,
      currency: 'usd',
    });
    stripePriceId = price.id;

    // 4️. Assign Stripe IDs
    payload.stripeProductId = stripeProductId;
    payload.stripePriceId = stripePriceId;

    // 5️. Create Plan in DB
    const [plan] = await Plan.create([payload], { session });

    // 6️. Commit DB transaction
    await session.commitTransaction();
    return plan;

  } catch (error) {
    // DB rollback
    await session.abortTransaction();

    // STRIPE CLEANUP
    try {
      if (stripePriceId) {
        await stripe.prices.update(stripePriceId, { active: false });
      }

      if (stripeProductId) {
        await stripe.products.del(stripeProductId);
      }
    } catch (cleanupError) {
      console.error('Stripe cleanup failed:', cleanupError);
    }

    throw error;

  } finally {
    session.endSession();
  }
};

export const PlanServices = {
  createPlanIntoDB,
};