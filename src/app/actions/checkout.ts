'use server';

import { stripe } from '@/lib/stripe';
import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { supabase } from '@/integrations/supabase/client';

// IMPORTANT: Replace this with your actual Stripe Price ID for the course.
// You can find this in your Stripe Dashboard under Products.
const COURSE_PRICE_ID = process.env.STRIPE_COURSE_PRICE_ID || 'price_replace_me';

export async function createCheckoutSession(userId: string, courseId: string, userEmail: string | null) {
  if (!userId) {
    return { error: 'User must be logged in to purchase.' };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
  
  try {
    // Create a Stripe Checkout Session for direct checkout on platform
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: COURSE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/courses?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/courses`,
      customer_email: userEmail || undefined,
      client_reference_id: userId,
      metadata: {
        course_id: courseId,
        user_id: userId,
      },
      // Enable direct platform checkout
      payment_intent_data: {
        setup_future_usage: 'on_session',
      },
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['BR'],
      },
    });

    if (!session.url) {
      throw new Error('Failed to create checkout session');
    }

    // Redirect to Stripe Checkout
    redirect(session.url);
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function getSessionStatus(sessionId: string): Promise<{ status: Stripe.Checkout.Session.Status | null, client_reference_id: string | null, metadata: Stripe.Metadata | null }> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });
    
    return { 
      status: session.status, 
      client_reference_id: session.client_reference_id, 
      metadata: session.metadata 
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

// Função para registrar o acesso ao curso após pagamento
export async function registerCourseAccess(userId: string, courseId: string) {
  try {
    // Atualizar o status de acesso na tabela public.users
    const { error } = await supabase
      .from('users')
      .update({ 
        estacoes_espirituais_access: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error registering course access:', error);
    return { success: false, error: 'Falha ao registrar acesso ao curso' };
  }
}