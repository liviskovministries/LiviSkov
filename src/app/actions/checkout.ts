'use server';

import { supabase } from '@/integrations/supabase/client';

// URL direta do checkout do Stripe fornecido
const STRIPE_CHECKOUT_URL = 'https://buy.stripe.com/6oUbJ37bDbe46U0fbM5ZC00';

export async function createCheckoutSession(userId: string, courseId: string, userEmail: string | null) {
  if (!userId) {
    return { error: 'User must be logged in to purchase.' };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
  
  try {
    // Simplesmente retornar a URL para redirecionamento no cliente
    const redirectUrl = new URL(STRIPE_CHECKOUT_URL);
    
    // Adicionar parâmetros para identificar o usuário e curso
    redirectUrl.searchParams.set('client_reference_id', userId);
    redirectUrl.searchParams.set('prefilled_email', userEmail || '');
    redirectUrl.searchParams.set('success_url', `${appUrl}/courses?payment_success=true`);
    redirectUrl.searchParams.set('cancel_url', `${appUrl}/courses`);
    
    return { checkoutUrl: redirectUrl.toString() };
    
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
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