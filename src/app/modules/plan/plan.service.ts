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
      { name: payload.name, isDeleted: false },
      null,
      { session },
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
        await stripe.products.update(stripeProductId, { active: false });
      }
    } catch (cleanupError) {
      console.error('Stripe cleanup failed:', cleanupError);
    }

    throw error;
  } finally {
    session.endSession();
  }
};

// --------------- delete plan ---------------
const deletePlanFromDB = async (id: string) => {
  const session = await mongoose.startSession();

  try {
    // DB TRANSACTION (short & safe)
    session.startTransaction();

    const plan = await Plan.findById(id, null, { session });
    if (!plan) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Plan not found');
    }

    if (plan.isDeleted) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Plan already deleted');
    }

    const result = await Plan.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true, session },
    );
    await session.commitTransaction();

    // STRIPE CLEANUP
    try {
      await stripe.prices.update(plan.stripePriceId, { active: false });
      await stripe.products.update(plan.stripeProductId, { active: false });
    } catch (stripeError) {
      throw stripeError;
    }

    return result;
  } catch (error) {
    // rollback DB if DB failed
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    // COMPENSATION (guarantee)
    await Plan.findByIdAndUpdate(id, { isDeleted: false });
    throw error;
  } finally {
    session.endSession();
  }
};

export const PlanServices = {
  createPlanIntoDB,
  deletePlanFromDB,
};
