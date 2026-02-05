import Stripe from 'stripe';
import { Advertisement } from '../../modules/advertisement/advertisement.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { PAYMENT_STATUS } from '../../modules/advertisement/advertisement.constants';

// on checkout session completed
const onCheckoutSessionCompleted = async (session: Stripe.Checkout.Session) => {
  try {
    // Pull the IDs you saved in metadata
    const advertisementId = session.metadata?.advertisementId;

    // check if advertisement exists
    const advertisement = await Advertisement.exists({ _id: advertisementId });
    if (!advertisement) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Advertisement not found');
    }

    // update advertisement status
    await Advertisement.findByIdAndUpdate(advertisementId, {
      paymentStatus: PAYMENT_STATUS.Paid,
    });
  } catch (error) {
    console.error(
      `~ error on [stripe webhook] onCheckoutSessionCompleted: ${error}`,
    );
  }
};

export const stripeWebhookServices = { onCheckoutSessionCompleted };
