import { StatusCodes } from 'http-status-codes';
import { stripe } from '../../../config/stripe';
import ApiError from '../../../errors/ApiError';
import { Advertiser } from '../advertiser/advertiser.model';
import { IAdvertisement } from './advertisement.interface';
import { Advertisement } from './advertisement.model';
import config from '../../../config';

// ----------------- create advertisement -----------------
export const createAdvertisementIntoDB = async (payload: IAdvertisement) => {
  // check if the user exists
  const advertiser = await Advertiser.exists({ user: payload.user });
  if (!advertiser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User does not exist');
  }
  payload.advertiser = advertiser._id;

  const result = await Advertisement.create(payload);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Failed to create advertisement',
    );
  }

  // create stripe checkout session
  const res = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: payload.priceId,
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${config.frontend_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.frontend_url}/payment/cancelled/?session_id={CHECKOUT_SESSION_ID}`,
  });

  return res?.url;
};

export const AdvertisementServices = {
  createAdvertisementIntoDB,
};
