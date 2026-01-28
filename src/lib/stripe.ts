import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('STRIPE_SECRET_KEY environment variable not set.');
  } else {
    console.warn('STRIPE_SECRET_KEY environment variable not set. Stripe functionality will not work.');
  }
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2024-06-20',
  typescript: true,
});
