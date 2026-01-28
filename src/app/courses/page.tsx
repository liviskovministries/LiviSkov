'use client';

import { useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, useUser } from '@/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState, useTransition } from 'react';
import { SiteHeader } from '@/components/header';
import { SiteFooter } from '@/components/footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { collection, doc } from 'firebase/firestore';
import { createCheckoutSession, getSessionStatus } from '@/app/actions/checkout';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseUser } from '@/integrations/supabase/supabase-provider';
import { supabase } from '@/integrations/supabase/client';

const courses = [
  {
    id: 'estacoes-espirituais',
    title: 'Curso Estações Espirituais',
    description: 'Aprenda a reconhecer e a viver plenamente cada estação da sua vida com Deus.',
    imageUrl: '/images/logo-curso-estacoes-espirituais.jpg', // Updated to the new logo
    imageHint: 'spiritual journey',
  }
];

function CheckoutHandler() {
  const { user: supabaseUser } = useSupabaseUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  // Não precisamos mais de Firebase enrollments aqui, pois o acesso será verificado na tabela users do Supabase.

  useEffect(() => {
    const paymentSuccess = searchParams.get('payment_success');
    const sessionId = searchParams.get('session_id');
    
    if (paymentSuccess === 'true' && sessionId && supabaseUser) {
      const verifyAndEnroll = async () => {
        try {
          toast({ title: "Verificando pagamento..." });
          
          const session = await getSessionStatus(sessionId);
          
          // No novo fluxo, a verificação real do pagamento e a atualização do acesso
          // ocorreriam via webhook do Stripe ou uma API mais robusta.
          // Por enquanto, simulamos o sucesso e atualizamos o acesso.
          if (session.status === 'complete' && supabaseUser.id) {
            const courseId = 'estacoes-espirituais'; // Hardcoded para o curso atual
            
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

function CoursesPageContent() {
  const { user: supabaseUser, isUserLoading: isSupabaseUserLoading } = useSupabaseUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [userCourseAccess, setUserCourseAccess] = useState<boolean | null>(null);
  const [isAccessLoading, setIsAccessLoading] = useState(true);

  useEffect(() => {
    const fetchUserAccess = async () => {
      if (!supabaseUser) {
        setIsAccessLoading(false);
        return;
      }

      setIsAccessLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('estacoes_espirituais_access')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error fetching user course access:', error);
        setUserCourseAccess(false);
      } else {
        setUserCourseAccess(data?.estacoes_espirituais_access || false);
      }
      setIsAccessLoading(false);
    };

    fetchUserAccess();
  }, [supabaseUser]);

  const handlePurchase = (courseId: string) => {
    if (!supabaseUser) {
      router.push('/login?redirect=/courses');
      return;
    }
    
    // Redirecionar diretamente para o link do Stripe
    window.location.href = 'https://buy.stripe.com/6oUbJ37bDbe46U0fbM5ZC00';
  }

  if (isSupabaseUserLoading || isAccessLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Carregando...</p>
      </div>
    );
  }

  // Determine the display name
  const displayName = supabaseUser?.user_metadata?.first_name && supabaseUser?.user_metadata?.last_name
    ? `${supabaseUser.user_metadata.first_name} ${supabaseUser.user_metadata.last_name}`
    : supabaseUser?.user_metadata?.first_name
      ? supabaseUser.user_metadata.first_name
      : supabaseUser?.email || 'Aluno(a)';

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Updated banner with the attached image */}
        <section className="relative h-[40vh] min-h-[300px] w-full bg-secondary text-foreground">
          <Image 
            src="/images/member-area-banner.jpg" 
            alt="Ambiente de aprendizado inspirador" 
            fill 
            className="object-cover" 
            priority 
            data-ai-hint="learning environment"
          />
          <div className="absolute inset-0 bg-background/60" />
          <div className="container relative z-10 flex h-full flex-col items-center justify-center text-center">
            <h1 className="text-4xl font-bold text-primary md:text-5xl">
              Área de Membros
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-foreground/80 md:text-xl">
              {supabaseUser ? `Bem-vindo(a), ${displayName}! ` : ''}
              Sua jornada de crescimento começa aqui.
            </p>
          </div>
        </section>
        
        <div className="container py-12 md:py-20">
          <div className="mt-12 flex flex-col items-center gap-8">
            {courses.map((course) => {
              const isEnrolled = userCourseAccess; // Verifica o acesso do usuário
              
              return (
                <Card key={course.id} className="w-full max-w-4xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl md:flex">
                  <div className="relative h-60 w-full md:h-auto md:w-1/2 flex-shrink-0">
                    <Image 
                      src={course.imageUrl} 
                      alt={`Imagem do curso ${course.title}`} 
                      fill 
                      className="object-cover" 
                      data-ai-hint={course.imageHint}
                    />
                  </div>
                  <div className="flex flex-col p-6 md:p-8">
                    <CardHeader className="p-0">
                      <CardTitle className="text-2xl font-bold text-primary">{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 mt-4">
                      <CardDescription className="text-lg text-muted-foreground">{course.description}</CardDescription>
                    </CardContent>
                    <CardFooter className="p-0 mt-6">
                      {isEnrolled ? (
                        <Link href={`/courses/${course.id}`} className="w-full md:w-auto">
                          <Button size="lg" className="w-full">Acessar Curso</Button>
                        </Link>
                      ) : (
                        <Button onClick={() => handlePurchase(course.id)} size="lg" className="w-full" disabled={isPending}>
                          {isPending ? 'Aguarde...' : 'Comprar Curso'}
                        </Button>
                      )}
                    </CardFooter>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export default function CoursesPage() {
  return (
    <>
      <CoursesPageContent />
      <CheckoutHandler />
    </>
  );
}