import Stripe from 'stripe';
import config from '.';

if (!config.stripe.secret_key) {
  throw new Error('Stripe secret key is not defined');
}

export const stripe = new Stripe(config.stripe.secret_key as string, {
  apiVersion: '2026-01-28.clover',
});
