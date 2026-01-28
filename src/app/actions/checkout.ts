'use server';

import { redirect } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';

export async function createCheckoutSession(userId: string, courseId: string, userEmail: string | null) {
  if (!userId) {
    return { error: 'User must be logged in to purchase.' };
  }

  const stripePaymentLink = 'https://buy.stripe.com/6oUbJ37bDbe46U0fbM5ZC00';
  
  const redirectUrl = `${stripePaymentLink}?client_reference_id=${userId}&prefilled_email=${userEmail || ''}`;
  
  redirect(redirectUrl);
}

export async function getSessionStatus(sessionId: string): Promise<{ status: string | null, client_reference_id: string | null, metadata: any }> {
  return { 
    status: 'complete', 
    client_reference_id: null, 
    metadata: null 
  };
}

export async function registerCourseAccess(userId: string, courseId: string) {
  try {
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