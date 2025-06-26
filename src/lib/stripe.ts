import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.error('Missing Stripe publishable key in environment variables');
  throw new Error('Missing Stripe publishable key');
}

if (!stripePublishableKey.startsWith('pk_')) {
  console.error('Invalid Stripe publishable key format:', stripePublishableKey);
  throw new Error('Invalid Stripe publishable key format');
}

export const stripePromise = loadStripe(stripePublishableKey);