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
import QueryBuilder from '../../builder/QueryBuilder';
import { AD_STATUS, PAYMENT_STATUS } from './advertisement.constants';
import { User } from '../user/user.model';
import { Setting } from '../setting/setting.model';
import { calculateExpireDate } from '../../../util/calculateExpireDate';

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
    plan = await Plan.findById(payload.plan, null, { session }).select(
      'name price stripePriceId',
    );
    if (!plan) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Plan does not exist');
    }
    payload.price = plan.price;
    payload.startAt = new Date(
      new Date(payload.startAt).setUTCHours(0, 0, 0, 0),
    );
    payload.endAt = calculateExpireDate(
      plan.name,
      1,
      new Date(payload.startAt),
    );

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
const updateAdvertisementIntoDB = async (
  id: string,
  payload: Partial<IAdvertisement>,
) => {
  // check if advertisement exists
  const existingAd = await Advertisement.findById(id);
  if (!existingAd) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Advertisement not found');
  }

  const result = await Advertisement.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true },
  );

  // unlink old image
  if (payload.image && existingAd.image && result) {
    await unlinkFile(existingAd.image);
  }

  return result;
};

// ----------------- update advertisement approval status -----------------
const updateAdvertisementStatus = async (
  id: string,
  payload: Partial<IAdvertisement>,
) => {
  // check if advertisement exists
  const existingAd = await Advertisement.findById(id);
  if (!existingAd) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Advertisement not found');
  }

  const result = await Advertisement.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true },
  );
  return result;
};

// ----------------- delete advertisement -----------------
const deleteAdvertisementFromDB = async (id: string) => {
  // check if advertisement exists
  const existingAd = await Advertisement.exists({ _id: id });
  if (!existingAd) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Advertisement not found');
  }

  const result = await Advertisement.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true },
  );
  return result;
};

// ----------------- get advertisements by user id -----------------
const getAdvertisementsByUserId = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const adQuery = new QueryBuilder(
    Advertisement.find({ user: userId, isDeleted: false }),
    query,
  )
    .filter()
    .paginate()
    .sort()
    .fields();

  const [data, pagination] = await Promise.all([
    adQuery.modelQuery.lean(),
    adQuery.getPaginationInfo(),
  ]);

  return { data, pagination };
};

// ----------------- get single advertisement by id -----------------
const getAdvertisementById = async (id: string) => {
  const result = await Advertisement.findById(id);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Advertisement not found');
  }
  return result;
};

// ----------------- get all advertisements -----------------
const getAllAdvertisements = async (query: Record<string, unknown>) => {
  const adQuery = new QueryBuilder(
    Advertisement.find({}).populate('user', 'name email image'),
    query,
  )
    .search(['title', 'description'])
    .filter()
    .paginate()
    .sort()
    .fields();

  const [data, pagination] = await Promise.all([
    adQuery.modelQuery.lean(),
    adQuery.getPaginationInfo(),
  ]);

  return { data, pagination };
};

// ----------------- get active advertisement -----------------
const getActiveAdvertisements = async (query: Record<string, unknown>) => {
  const lng = parseFloat(query.lng as string);
  const lat = parseFloat(query.lat as string);
  const setting = await Setting.findOne().select('nearbyRange');

  const nearbyAds = await Advertisement.find({
    focusAreaLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat], // [lng, lat]
        },
        $maxDistance: (setting?.nearbyRange || 50) * 1000, // meters
      },
    },
    isDeleted: false,
    status: AD_STATUS.Active,
    paymentStatus: PAYMENT_STATUS.Paid,
  }).select('title image websiteUrl');

  return nearbyAds;
};

// ----------------- get advertiser overview -----------------
export const getAdvertiserOverview = async (userId: string) => {
  const overview = await Advertisement.aggregate([
    // 1️. Filter by user and non-deleted ads
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
        status: AD_STATUS.Active, // Only active ads for totalActiveAds
      },
    },
    // 2️. Group and calculate totals
    {
      $group: {
        _id: null,
        totalActiveAds: { $sum: 1 },
        totalReachCount: { $sum: '$reachCount' },
        totalClickCount: { $sum: '$clickCount' },
      },
    },
    // 3️. Calculate engagement rate
    {
      $project: {
        _id: 0,
        totalActiveAds: 1,
        totalReachCount: 1,
        totalClickCount: 1,
        engagementRate: {
          $cond: [
            { $eq: ['$totalReachCount', 0] },
            0,
            {
              $multiply: [
                { $divide: ['$totalClickCount', '$totalReachCount'] },
                100,
              ],
            },
          ],
        },
      },
    },
  ]);

  // Return default values if no ads found
  return {
    totalActiveAds: overview[0]?.totalActiveAds || 0,
    totalReachCount: overview[0]?.totalReachCount || 0,
    totalClickCount: overview[0]?.totalClickCount || 0,
    engagementRate: +(overview[0]?.engagementRate || 0).toFixed(2) || 0, // fix precision 2 digits
  };
};

export const AdvertisementServices = {
  createAdvertisementIntoDB,
  updateAdvertisementIntoDB,
  updateAdvertisementStatus,
  deleteAdvertisementFromDB,
  getAdvertisementsByUserId,
  getAdvertisementById,
  getAllAdvertisements,
  getActiveAdvertisements,
  getAdvertiserOverview,
};
