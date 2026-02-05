import Stripe from 'stripe';
import { stripeWebhookServices } from './stripe.service';
import { StripeEvent } from '../../modules/stripeEvent/stripeEvent.model';

export async function stripeEventHandler(event: Stripe.Event) {
  // Idempotency guard
  const alreadyProcessed = await StripeEvent.exists({ id: event.id });
  if (alreadyProcessed) {
    return;
  }

  // event routing
  switch (event.type) {
    case 'checkout.session.completed':
      await stripeWebhookServices.onCheckoutSessionCompleted(event.data.object);
      break;

    default:
  }

  // log processed event
  try {
    await StripeEvent.create({
      id: event.id,
      type: event.type,
    });
  } catch (err: any) {
    if (err.code === 11000) return; // already processed
    throw err;
  }
}
