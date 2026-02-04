import { StatusCodes } from 'http-status-codes';
import { stripe } from '../../../config/stripe';
import ApiError from '../../../errors/ApiError';
import { Advertiser } from '../advertiser/advertiser.model';
import { IAdvertisement } from './advertisement.interface';
import { Advertisement } from './advertisement.model';
import config from '../../../config';
import { Plan } from '../plan/plan.model';
import mongoose from 'mongoose';
import unlinkFile from '../../../shared/unlinkFile';

// ----------------- create advertisement -----------------

export const createAdvertisementIntoDB = async (payload: IAdvertisement) => {
  const session = await mongoose.startSession();
  let createdAd, plan;

  try {
    session.startTransaction();

    // check advertiser
    const advertiser = await Advertiser.findOne({ user: payload.user }, null, {
      session,
    }).select('_id');
    if (!advertiser) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Advertiser does not exist');
    }
    payload.advertiser = advertiser._id;

    // check plan
    plan = await Plan.findById(payload.plan, null, { session }).select('price');
    if (!plan) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Plan does not exist');
    }
    payload.price = plan.price;

    // create advertisement (DB write)
    createdAd = await Advertisement.create([payload], { session });
    createdAd = createdAd[0];

    await session.commitTransaction();
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    session.endSession();
  }

  // STRIPE (outside transaction)
  try {
    const stripeRes = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${config.frontend_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.frontend_url}/payment/cancelled?session_id={CHECKOUT_SESSION_ID}`,
      client_reference_id: payload.user.toString(),
      metadata: {
        advertisementId: createdAd._id.toString(),
        advertiserId: createdAd.advertiser.toString(),
        userId: createdAd.user.toString(),
      },
    });

    return {
      url: stripeRes.url,
      sessionId: stripeRes.id,
    };
  } catch (error) {
    // 5️⃣ COMPENSATION (rollback DB)
    await Advertisement.findByIdAndDelete(createdAd._id);
    throw error;
  }
};
 
// ----------------- update advertisement -----------------
const updateAdvertisementIntoDB = async (id: string, payload: Partial<IAdvertisement>) => {
  // check if advertisement exists
  const existingAd = await Advertisement.findById(id);
  if (!existingAd) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Advertisement not found');
  }
  
  const result = await Advertisement.findByIdAndUpdate(id, { $set: payload }, { new: true });
  
  // unlink old image
  if (payload.image && existingAd.image && result) {
    await unlinkFile(existingAd.image);
  }

  return result;
};

export const AdvertisementServices = {
  createAdvertisementIntoDB,
  updateAdvertisementIntoDB,
};
