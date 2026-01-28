'use client';

import { useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking } from '@/firebase'; // Removido useUser do Firebase
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, Suspense, useState, useTransition } from 'react';
import { SiteHeader } from '@/components/header';
import { SiteFooter } from '@/components/footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { collection, doc } from 'firebase/firestore';
import { createCheckoutSession, getSessionStatus } from '@/app/actions/checkout';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseUser } from '@/integrations/supabase/supabase-provider'; // Usar hook Supabase

// Mock data for courses
const courses = [
  {
    id: 'estacoes-espirituais',
    title: 'Curso Estações Espirituais',
    description: 'Aprenda a reconhecer e a viver plenamente cada estação da sua vida com Deus.',
    imageUrl: 'https://picsum.photos/seed/course1/800/450',
    imageHint: 'spiritual journey',
  }
];


function CheckoutHandler() {
  const { user: supabaseUser } = useSupabaseUser(); // Usar Supabase user
  const firestore = useFirestore(); // Manter Firestore para enrollments
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const enrollmentsQuery = useMemoFirebase(() => {
    if (!supabaseUser || !firestore) return null; // Usar supabaseUser.id para o caminho do Firestore
    return collection(firestore, 'users', supabaseUser.id, 'enrollments');
  }, [supabaseUser, firestore]);
  const { data: enrollments } = useCollection<{courseId: string}>(enrollmentsQuery);

  useEffect(() => {
    const sessionId = searchParams.get('payment_success') === 'true' ? searchParams.get('session_id') : null;

    if (sessionId && supabaseUser && firestore) { // Usar supabaseUser
      const verifyAndEnroll = async () => {
        try {
          toast({ title: "Verificando pagamento..." });
          const session = await getSessionStatus(sessionId);
          
          if (session.status === 'complete' && session.client_reference_id === supabaseUser.id && session.metadata) { // Usar supabaseUser.id
            const courseId = session.metadata.courseId;
            const isAlreadyEnrolled = enrollments?.some(e => e.courseId === courseId);
            
            if (!isAlreadyEnrolled) {
              const enrollmentRef = doc(collection(firestore, 'users', supabaseUser.id, 'enrollments')); // Usar supabaseUser.id
              setDocumentNonBlocking(enrollmentRef, {
                id: enrollmentRef.id,
                userId: supabaseUser.id, // Usar supabaseUser.id
                courseId: courseId,
                enrollmentDate: new Date().toISOString(),
              }, { merge: true });

              toast({ title: "Compra confirmada!", description: "Sua inscrição no curso foi realizada com sucesso." });
              router.replace('/courses', { scroll: false });
            } else {
              router.replace('/courses', { scroll: false });
            }
          } else {
             toast({ variant: "destructive", title: "Falha na Verificação", description: "Não foi possível confirmar seu pagamento." });
             router.replace('/courses', { scroll: false });
          }
        } catch (e) {
          console.error("Error verifying payment session", e);
          toast({ variant: "destructive", title: "Erro na Verificação", description: "Ocorreu um erro ao verificar seu pagamento." });
          router.replace('/courses', { scroll: false });
        }
      };
      verifyAndEnroll();
    }
  }, [searchParams, supabaseUser, firestore, enrollments, router, toast]); // Adicionar supabaseUser às dependências

  return null;
}


function CoursesPageContent() {
  const { user: supabaseUser, isUserLoading: isSupabaseUserLoading } = useSupabaseUser(); // Usar Supabase user
  const router = useRouter();
  const firestore = useFirestore(); // Manter Firestore para enrollments
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const enrollmentsQuery = useMemoFirebase(() => {
    if (!supabaseUser || !firestore) return null; // Usar supabaseUser.id para o caminho do Firestore
    return collection(firestore, 'users', supabaseUser.id, 'enrollments');
  }, [supabaseUser, firestore]); // Adicionar supabaseUser às dependências

  const { data: enrollments, isLoading: enrollmentsLoading } = useCollection<{courseId: string}>(enrollmentsQuery);

  const handlePurchase = (courseId: string) => {
    if (!supabaseUser) { // Usar supabaseUser
      router.push('/login?redirect=/courses');
      return;
    }
    startTransition(async () => {
      const result = await createCheckoutSession(supabaseUser.id, courseId, supabaseUser.email); // Usar supabaseUser.id e email
      if(result?.error) {
        toast({
          variant: "destructive",
          title: "Erro ao iniciar compra",
          description: result.error,
        });
      }
    });
  }

  if (isSupabaseUserLoading || (supabaseUser && enrollmentsLoading)) { // Usar isSupabaseUserLoading e supabaseUser
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative h-[40vh] min-h-[300px] w-full bg-secondary text-foreground">
          <Image
            src="https://picsum.photos/seed/learning/1800/600"
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
              {supabaseUser ? `Bem-vindo(a), ${supabaseUser.user_metadata?.first_name || supabaseUser.email || 'Aluno(a)'}! ` : ''}Sua jornada de crescimento começa aqui.
            </p>
          </div>
        </section>

        <div className="container py-12 md:py-20">
          <div className="mt-12 flex flex-col items-center gap-8">
            {courses.map((course) => {
              const isEnrolled = !!supabaseUser && enrollments?.some(e => e.courseId === course.id); // Usar supabaseUser

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
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><p>Carregando...</p></div>}>
            <CoursesPageContent />
            <CheckoutHandler />
        </Suspense>
    );
}