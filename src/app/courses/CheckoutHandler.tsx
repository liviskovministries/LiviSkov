'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseUser } from '@/integrations/supabase/supabase-provider';
import { supabase } from '@/integrations/supabase/client';
import { getSessionStatus, registerCourseAccess } from '@/app/actions/checkout'; // Importar registerCourseAccess

function CheckoutHandler() {
  const { user: supabaseUser } = useSupabaseUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  useEffect(() => {
    const paymentSuccess = searchParams.get('payment_success');
    const sessionId = searchParams.get('session_id');
    const clientReferenceId = searchParams.get('client_reference_id'); // Obter client_reference_id

    if (paymentSuccess === 'true' && sessionId && supabaseUser && clientReferenceId) {
      const verifyAndEnroll = async () => {
        try {
          toast({ title: "Verificando pagamento..." });
          
          const session = await getSessionStatus(sessionId);
          
          if (session.status === 'complete' && supabaseUser.id) {
            // Extrair userId e courseId do clientReferenceId
            const [userIdFromRef, courseId] = clientReferenceId.split('|');

            if (userIdFromRef !== supabaseUser.id) {
              throw new Error('ID de usuário não corresponde ao pagamento.');
            }
            
            // Chamar a função registerCourseAccess com o courseId correto
            const { success, error: registerError } = await registerCourseAccess(supabaseUser.id, courseId);
            
            if (registerError) {
              console.error('Error registering course access:', registerError);
              toast({
                variant: "destructive",
                title: "Erro ao conceder acesso",
                description: `Não foi possível conceder acesso ao curso: ${registerError}`
              });
            } else if (success) {
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