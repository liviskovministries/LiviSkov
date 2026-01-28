'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseUser } from '@/integrations/supabase/supabase-provider';
import { supabase } from '@/integrations/supabase/client';
import { getSessionStatus } from '@/app/actions/checkout';

function CheckoutHandler() {
  const { user: supabaseUser } = useSupabaseUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  useEffect(() => {
    const paymentSuccess = searchParams.get('payment_success');
    const sessionId = searchParams.get('session_id');
    
    if (paymentSuccess === 'true' && sessionId && supabaseUser) {
      const verifyAndEnroll = async () => {
        try {
          toast({ title: "Verificando pagamento..." });
          
          const session = await getSessionStatus(sessionId);
          
          if (session.status === 'complete' && supabaseUser.id) {
            const courseId = 'estacoes-espirituais';
            
            // Atualizar o status de acesso na tabela public.users
            const { error } = await supabase
              .from('users')
              .update({ 
                estacoes_espirituais_access: true, 
                updated_at: new Date().toISOString() 
              })
              .eq('id', supabaseUser.id);
            
            if (error) {
              console.error('Error updating Supabase user course access:', error);
              toast({
                variant: "destructive",
                title: "Erro ao conceder acesso",
                description: `Não foi possível conceder acesso ao curso: ${error.message}`
              });
            } else {
              toast({
                title: "Compra confirmada!",
                description: "Sua inscrição no curso foi realizada com sucesso."
              });
            }
            
            router.replace('/courses', { scroll: false });
          } else {
            toast({
              variant: "destructive",
              title: "Falha na Verificação",
              description: "Não foi possível confirmar seu pagamento."
            });
            router.replace('/courses', { scroll: false });
          }
        } catch (e: any) {
          console.error("Error verifying payment session", e);
          toast({
            variant: "destructive",
            title: "Erro na Verificação",
            description: e.message || "Ocorreu um erro ao verificar seu pagamento."
          });
          router.replace('/courses', { scroll: false });
        }
      };
      
      verifyAndEnroll();
    }
  }, [searchParams, supabaseUser, router, toast]);

  return null;
}

export default CheckoutHandler;