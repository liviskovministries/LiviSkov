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
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      client_reference_id: userId,
      customer_email: userEmail || undefined,
      line_items: [
        {
          price: COURSE_PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: {
        courseId: courseId,
        userId: userId,
      },
      success_url: `${appUrl}/courses?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/courses`,
    });

    if (!checkoutSession.url) {
      // This is an unlikely scenario but good to handle.
      return { error: 'Could not create checkout session.' };
    }
    
    redirect(checkoutSession.url);

  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function getSessionStatus(sessionId: string): Promise<{
    status: Stripe.Checkout.Session.Status | null,
    client_reference_id: string | null,
    metadata: Stripe.Metadata | null
}> {
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        return {
            status: session.status,
            client_reference_id: session.client_reference_id,
            metadata: session.metadata
        };
    } catch (error) {
        console.error(`Error retrieving session ${sessionId}:`, error);
        return { status: null, client_reference_id: null, metadata: null };
    }
}
