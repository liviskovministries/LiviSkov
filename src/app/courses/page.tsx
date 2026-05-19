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
import { PlaceHolderImages } from '@/lib/placeholder-images'; // Importar PlaceHolderImages

const courses = [
  {
    id: 'estacoes-espirituais',
    title: 'Curso Estações Espirituais',
    description: 'Aprenda a reconhecer e a viver plenamente cada estação da sua sua vida com Deus.',
    imageUrl: PlaceHolderImages.find(img => img.id === 'estacoes-espirituais-logo')?.imageUrl || '/images/fundo.jpg',
    imageHint: PlaceHolderImages.find(img => img.id === 'estacoes-espirituais-logo')?.imageHint || 'spiritual journey',
    stripePaymentLink: 'https://buy.stripe.com/6oUbJ37bDbe46U0fbM5ZC00', // Link de pagamento para Estações Espirituais
    enrollmentDeadline: new Date('2024-07-19T23:59:59'), // Exemplo: 19 de Julho de 2024, 23:59:59
  },
  {
    id: 'devocional-2026',
    title: 'Devocional 2026 - Um novo ano, um recomeço',
    description: '31 dias de encorajamento, renovo e recomeços na palavra',
    imageUrl: PlaceHolderImages.find(img => img.id === 'devocional-2026-banner')?.imageUrl || '/images/devocional-2026-banner.jpg',
    imageHint: PlaceHolderImages.find(img => img.id === 'devocional-2026-banner')?.imageHint || 'devotional new year new beginning',
    stripePaymentLink: 'https://buy.stripe.com/00w5kFeE52Hyems9Rs5ZC02', // **LINK ATUALIZADO**
    enrollmentDeadline: null, // Sem data limite para este curso, ou defina uma se houver
  },
  {
      id: 'oficios-ministeriais',
      title: 'Os 5 Ofícios Ministeriais',
      description: 'Desenvolva uma vida ministerial com os cinco ofícios do ministério: Apóstolo, Profeta, Evangelista, Pastor e Mestre.',
      imageUrl: PlaceHolderImages.find(img => img.id === 'oficios-ministeriais-logo')?.imageUrl || '/images/logo-oficios-ministeriais.png',
      imageHint: PlaceHolderImages.find(img => img.id === 'oficios-ministeriais-logo')?.imageHint || 'Os 5 Ofícios Ministeriais logo',
      stripePaymentLink: 'https://buy.stripe.com/placeholder-oficios-ministeriais',
      enrollmentDeadline: null,
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
  // userCoursesAccess agora é um objeto para armazenar o status de acesso de cada curso
  const [userCoursesAccess, setUserCoursesAccess] = useState<Record<string, boolean>>({});
  const [isAccessLoading, setIsAccessLoading] = useState(true);

  useEffect(() => {
    const fetchUserAccess = async () => {
      if (!supabaseUser) {
        setIsAccessLoading(false);
        return;
      }

      setIsAccessLoading(true);
      try {
        const { data, error } = await supabase
                  .from('users')
                  .select('estacoes_espirituais_access, devocional_2026_access, oficios_ministeriais_access') // Selecionar todas as colunas de acesso
                  .eq('id', supabaseUser.id)
                  .single();
        
                if (error) {
                  console.error('Error fetching user course access:', error);
                  setUserCoursesAccess({});
                } else {
                  setUserCoursesAccess({
                    'estacoes-espirituais': data?.estacoes_espirituais_access || false,
                    'devocional-2026': data?.devocional_2026_access || false,
                    'oficios-ministeriais': data?.oficios_ministeriais_access || false,
                  });
                }
      } catch (error) {
        console.error('Error fetching user course access:', error);
        setUserCoursesAccess({});
      } finally {
        setIsAccessLoading(false);
      }
    };

    fetchUserAccess();
  }, [supabaseUser]);

  const handlePurchase = (courseId: string, stripePaymentLink: string, enrollmentDeadline: Date | null) => {
    if (enrollmentDeadline && new Date() > enrollmentDeadline) {
      toast({
        variant: "destructive",
        title: "Inscrições Encerradas",
        description: "As inscrições para este curso foram encerradas."
      });
      return;
    }

    if (!supabaseUser) {
      router.push(`/login?redirect=/courses&courseId=${courseId}`); // Passar courseId para redirecionamento
      return;
    }
    
    // Abrir link do Stripe em nova janela
    // O client_reference_id agora inclui userId e courseId
    const clientReferenceId = `${supabaseUser.id}|${courseId}`;
    const redirectUrl = `${stripePaymentLink}?client_reference_id=${clientReferenceId}&prefilled_email=${supabaseUser.email || ''}`;

    window.open(redirectUrl, '_blank', 'noopener,noreferrer');
    
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
              const isEnrolled = userCoursesAccess[course.id]; // Verificar acesso para o curso específico
              const hasEnrollmentEnded = course.enrollmentDeadline ? new Date() > course.enrollmentDeadline : false;
              
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
                          <Button size="lg" className="w-full">
                            {course.id === 'devocional-2026' ? 'Acessar Devocional' : 'Acessar Curso'}
                          </Button>
                        </Link>
                      ) : (
                        <Button 
                          onClick={() => handlePurchase(course.id, course.stripePaymentLink, course.enrollmentDeadline)} 
                          size="lg" 
                          className="w-full" 
                          disabled={isPending || hasEnrollmentEnded} // Desabilitar se as inscrições encerraram
                        >
                          {hasEnrollmentEnded ? (
                            <span className="flex items-center gap-2">
                              <Lock className="h-5 w-5" /> Inscrições Encerradas
                            </span>
                          ) : (
                            isPending 
                              ? 'Aguarde...' 
                              : course.id === 'devocional-2026' ? 'Comprar Devocional' : 'Comprar Curso'
                          )}
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