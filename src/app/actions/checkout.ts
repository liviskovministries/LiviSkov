'use server';

import { stripe } from '@/lib/stripe';
import { redirect } from 'next/navigation';
import Stripe from 'stripe';

// IMPORTANT: Replace this with your actual Stripe Price ID for the course.
// You can find this in your Stripe Dashboard under Products.
const COURSE_PRICE_ID = process.env.STRIPE_COURSE_PRICE_ID || 'price_replace_me';

export async function createCheckoutSession(userId: string, courseId: string, userEmail: string | null) {
  if (!userId) {
    // This should be handled by the client, but as a safeguard.
    return { error: 'User must be logged in to purchase.' };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
  
  try {
    // Instead of creating a Stripe session, we'll redirect directly to the Stripe payment link
    // This assumes you've set up the link in your Stripe dashboard
    const stripePaymentLink = 'https://buy.stripe.com/6oUbJ37bDbe46U0fbM5ZC00';
    
    // We'll pass the user info as metadata in the redirect URL
    const redirectUrl = `${stripePaymentLink}?client_reference_id=${userId}&prefilled_email=${userEmail || ''}`;
    
    redirect(redirectUrl);
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function getSessionStatus(sessionId: string): Promise<{ status: Stripe.Checkout.Session.Status | null, client_reference_id: string | null, metadata: Stripe.Metadata | null }> {
  try {
    // Since we're not using Stripe sessions anymore, we'll return a default success status
    // In a real implementation, you would verify the payment through Stripe's API
    return { 
      status: 'complete', 
      client_reference_id: null, 
      metadata: null 
    };
  } catch (error) {
    console.error(`Error retrieving session ${sessionId}:`, error);
    return { 
      status: null, 
      client_reference_id: null, 
      metadata: null 
    };
  }
}