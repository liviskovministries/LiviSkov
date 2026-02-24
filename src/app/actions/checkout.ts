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
    // This should be handled by the client, but as a safeguard.
    return { error: 'User must be logged in to purchase.' };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
  
  try {
    // Instead of creating a Stripe session, we'll redirect directly to the Stripe payment link
    // This assumes you've set up the link in your Stripe dashboard
    // The client_reference_id will now include both userId and courseId
    const clientReferenceId = `${userId}|${courseId}`;

    let stripePaymentLink = '';
    if (courseId === 'estacoes-espirituais') {
      stripePaymentLink = 'https://buy.stripe.com/6oUbJ37bDbe46U0fbM5ZC00'; // Link para Estações Espirituais
    } else if (courseId === 'devocional-2026') {
      stripePaymentLink = 'https://buy.stripe.com/replace_with_devocional_link'; // **SUBSTITUA ESTE LINK PELO SEU LINK DE PAGAMENTO DO STRIPE PARA O DEVOCIONAL 2026**
    } else {
      return { error: 'Course not found.' };
    }
    
    const redirectUrl = `${stripePaymentLink}?client_reference_id=${clientReferenceId}&prefilled_email=${userEmail || ''}`;
    
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

// Função para registrar o acesso ao curso após pagamento
export async function registerCourseAccess(userId: string, courseId: string) {
  try {
    let updateColumn: string;
    if (courseId === 'estacoes-espirituais') {
      updateColumn = 'estacoes_espirituais_access';
    } else if (courseId === 'devocional-2026') {
      updateColumn = 'devocional_2026_access';
    } else {
      return { success: false, error: 'Curso não reconhecido para registro de acesso.' };
    }

    // Atualizar o status de acesso na tabela public.users
    const { error } = await supabase
      .from('users')
      .update({ 
        [updateColumn]: true,
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