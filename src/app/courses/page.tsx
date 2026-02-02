'use client';

import { useEffect, useState, useTransition, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { SiteHeader } from '@/components/header';
import { SiteFooter } from '@/components/footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseUser } from '@/integrations/supabase/supabase-provider';
import { supabase } from '@/integrations/supabase/client';
import { Lock } from 'lucide-react'; // Importar o ícone de cadeado

const courses = [
  {
    id: 'estacoes-espirituais',
    title: 'Curso Estações Espirituais',
    description: 'Aprenda a reconhecer e a viver plenamente cada estação da sua vida com Deus.',
    imageUrl: '/images/logo-curso-estacoes-espirituais.jpg',
    imageHint: 'spiritual journey',
  }
];

// Componente suspensível que usa useSearchParams
const CheckoutHandler = dynamic(() => import('./CheckoutHandler'), {
  ssr: false,
  loading: () => null,
});

function CoursesPageContent() {
  const { user: supabaseUser, isUserLoading: isSupabaseUserLoading } = useSupabaseUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [userCourseAccess, setUserCourseAccess] = useState<boolean | null>(null);
  const [isAccessLoading, setIsAccessLoading] = useState(true);

  // Definir a data limite para as inscrições (ex: 19 de Julho de 2024)
  // Altere esta data para controlar quando as inscrições são encerradas.
  const enrollmentDeadline = new Date('2024-07-19T23:59:59'); // Exemplo: 19 de Julho de 2024, 23:59:59
  const hasEnrollmentEnded = new Date() > enrollmentDeadline;

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
    if (hasEnrollmentEnded) {
      toast({
        variant: "destructive",
        title: "Inscrições Encerradas",
        description: "As inscrições para este curso foram encerradas."
      });
      return;
    }

    if (!supabaseUser) {
      router.push('/login?redirect=/courses');
      return;
    }
    
    // Abrir link do Stripe em nova janela
    window.open('https://buy.stripe.com/6oUbJ37bDbe46U0fbM5ZC00', '_blank', 'noopener,noreferrer');
    
    // Mostrar mensagem informativa
    toast({
      title: "Abrindo página de pagamento",
      description: "A página de pagamento será aberta em uma nova aba. Após concluir o pagamento, volte aqui para acessar o curso."
    });
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
              const isEnrolled = userCourseAccess;
              
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
                        <Button 
                          onClick={() => handlePurchase(course.id)} 
                          size="lg" 
                          className="w-full" 
                          disabled={isPending || hasEnrollmentEnded} // Desabilitar se as inscrições encerraram
                        >
                          {hasEnrollmentEnded ? (
                            <span className="flex items-center gap-2">
                              <Lock className="h-5 w-5" /> Inscrições Encerradas
                            </span>
                          ) : (
                            isPending ? 'Aguarde...' : 'Comprar Curso'
                          )}
                        </Button>
                      )}
                    </CardFooter>
                  </div>
                </Card>
              );
            })}
          </div>

          {hasEnrollmentEnded && !userCourseAccess && (
            <div className="mt-12 text-center text-lg text-muted-foreground">
              <p>
                As inscrições para o curso Estações Espirituais foram encerradas.
                Se você se inscreveu a tempo, por favor,{' '}
                <Link href="/signup" className="font-semibold text-primary hover:underline">
                  cadastre-se no site
                </Link>{' '}
                e entre em contato conosco para ter acesso liberado ao seu login.
              </p>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center">
          <p>Carregando...</p>
        </div>
        <SiteFooter />
      </div>
    }>
      <CoursesPageContent />
      <CheckoutHandler />
    </Suspense>
  );
}