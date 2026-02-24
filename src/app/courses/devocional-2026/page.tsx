'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth, useSupabaseUser } from '@/integrations/supabase/supabase-provider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar, // Importar useSidebar
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Home, LogOut, PlayCircle, FileText, CheckCircle, Lock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import YouTube from 'react-youtube';
import { cn } from '@/lib/utils'; // Importar cn

type Lesson = {
  id: string;
  title: string;
  type: 'video' | 'resource';
  content?: string;
  videoId?: string;
  subtitle?: string;
  description: string;
  releaseDate?: string; // Adicionado para controle de desbloqueio de aulas individuais
};

const devocionalCourseData = {
  title: 'Devocional 2026 - Um novo ano, um recomeço',
  modules: [
    {
      id: 'devocional-intro',
      title: 'Introdução',
      releaseDate: '2026-01-01T00:00:00Z', // Exemplo: Disponível a partir de 1º de janeiro de 2026
      lessons: [
        {
          id: 'devocional-intro-video',
          title: 'Boas-vindas ao Devocional 2026',
          type: 'video' as const,
          videoId: 'Dc4EBMJXQgg', // Placeholder
          subtitle: 'Sua jornada de 31 dias começa aqui!',
          description: 'Bem-vindo(a) ao Devocional 2026! Prepare-se para 31 dias de encorajamento, renovo e recomeços na Palavra de Deus. Este é um convite para mergulhar mais fundo na fé e encontrar inspiração para um novo ano.',
          releaseDate: undefined, // Adicionado para consistência
        },
        {
          id: 'devocional-book',
          title: 'Livro Devocional 2026',
          type: 'resource' as const,
          subtitle: 'Seu guia para 31 dias de reflexão',
          description: 'Baixe o seu livro devocional em PDF. Ele contém todas as leituras, reflexões e espaços para anotações para cada um dos 31 dias. Um recurso essencial para sua jornada!',
          releaseDate: undefined, // Adicionado para consistência
        },
      ],
    },
    {
      id: 'devocional-days',
      title: 'Dias do Devocional',
      releaseDate: '2026-01-01T00:00:00Z', // Exemplo: Disponível a partir de 1º de janeiro de 2026
      lessons: Array.from({ length: 31 }, (_, i) => ({
        id: `day-${i + 1}`,
        title: `Dia ${i + 1}: Um Novo Começo`, // Placeholder title
        type: 'video' as const, // Assuming each day has a video
        videoId: 'Dc4EBMJXQgg', // Placeholder video ID
        subtitle: `Reflexão do Dia ${i + 1}`,
        description: `Neste dia, vamos refletir sobre a importância de um novo começo e como a graça de Deus nos capacita a recomeçar a cada manhã. Prepare seu coração para receber uma nova perspectiva.`,
        releaseDate: `2026-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`, // Desbloqueia um dia por vez
      })),
    },
  ],
};

export default function DevocionalPage() {
  const { user: firebaseUser, isUserLoading: isFirebaseUserLoading } = useUser();
  const { user: supabaseUser, isUserLoading: isSupabaseUserLoading } = useSupabaseUser();
  const supabaseAuth = useSupabaseAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [completionStatus, setCompletionStatus] = useState<Record<string, boolean>>({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date()); // Adicionado currentTime
  
  const courseId = 'devocional-2026';
  const sidebar = useSidebar(); // Usar o hook useSidebar

  // Inicializa a lição selecionada para a primeira lição de introdução
  useEffect(() => {
    if (!selectedLesson && devocionalCourseData.modules.length > 0 && devocionalCourseData.modules[0].lessons.length > 0) {
      setSelectedLesson(devocionalCourseData.modules[0].lessons[0]);
    }
  }, [selectedLesson]);

  // Atualiza o currentTime a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const progressDocRef = useMemoFirebase(() => {
    if (!firebaseUser || !firestore) return null;
    return doc(firestore, 'users', firebaseUser.uid, 'courseProgress', courseId);
  }, [firebaseUser, firestore]);

  const { data: progressData, isLoading: progressLoading } = useDoc<{ completedLessons: Record<string, boolean> }>(progressDocRef);

  useEffect(() => {
    if (progressData?.completedLessons) {
      setCompletionStatus(progressData.completedLessons);
    }
  }, [progressData]);

  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      if (!supabaseUser) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('devocional_2026_access')
          .eq('id', supabaseUser.id)
          .single();
        
        if (error) {
          console.error('Error checking Supabase user access:', error);
          setIsEnrolled(false);
        } else {
          setIsEnrolled(data?.devocional_2026_access || false);
        }
      } catch (error) {
        console.error('Error checking enrollment status:', error);
        setIsEnrolled(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkEnrollmentStatus();
  }, [supabaseUser]);

  useEffect(() => {
    if (!isSupabaseUserLoading && !supabaseUser) {
      router.push('/login');
    }
    
    if (!isSupabaseUserLoading && supabaseUser && !isLoading && !isEnrolled) {
      router.push('/courses');
    }
  }, [supabaseUser, isSupabaseUserLoading, router, isEnrolled, isLoading]);

  const markLessonAsComplete = (lessonId: string) => {
    if (!progressDocRef || completionStatus[lessonId]) return;
    
    const newStatus = {
      ...completionStatus,
      [lessonId]: true
    };
    
    setCompletionStatus(newStatus);
    
    setDocumentNonBlocking(progressDocRef, {
      id: courseId,
      completedLessons: newStatus
    }, { merge: true });
  };

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    if (lesson.type !== 'resource') { // Marcar como completo se não for um recurso (ex: livro)
      markLessonAsComplete(lesson.id);
    }
  };

  const handleVideoEnd = () => {
    if (selectedLesson?.type === 'video') {
      markLessonAsComplete(selectedLesson.id);
    }
  };

  const handleDownloadWatermarkedPdf = async () => {
    if (!supabaseUser) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para baixar o livro."
      });
      router.push('/login');
      return;
    }

    setIsDownloading(true);
    toast({
      title: "Preparando download...",
      description: "Seu livro com marca d'água está sendo gerado."
    });

    try {
      // Fetch user profile from public.users table for reliable data
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('first_name, last_name, email')
        .eq('id', supabaseUser.id)
        .single();

      if (profileError || !profileData) {
        console.error('Error fetching user profile from public.users:', profileError);
        throw new Error('Não foi possível obter os dados do seu perfil para o download.');
      }

      const firstName = profileData.first_name || '';
      const lastName = profileData.last_name || '';
      const email = profileData.email || '';

      console.log("[DevocionalPage] Downloading watermarked PDF for:", { firstName, lastName, email });

      const response = await fetch('https://rxvcxqfnkvqfxwzbujka.supabase.co/functions/v1/watermark-pdf-devocional', { // Novo endpoint para o devocional
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const pdfBlob = await response.blob();
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Livi-Skov-Devocional-2026-${firstName}-${lastName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download concluído!",
        description: "Seu livro com marca d'água foi baixado com sucesso."
      });

    } catch (error: any) {
      console.error("[DevocionalPage] Error downloading watermarked PDF:", error);
      toast({
        variant: "destructive",
        title: "Erro no download",
        description: `Não foi possível baixar o livro. Por favor, tente novamente mais tarde. Detalhes: ${error.message}`
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (isSupabaseUserLoading || !supabaseUser || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Verificando acesso...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    const { error } = await supabaseAuth.signOut();
    if (error) {
      console.error("Erro ao fazer logout:", error.message);
    } else {
      router.push('/');
    }
  };

  const renderLessonContent = () => {
    if (!selectedLesson) return <p>Selecione uma aula para começar.</p>;
    
    switch (selectedLesson.type) {
      case 'video':
        return (
          <div className="w-full aspect-video rounded-lg overflow-hidden">
            {selectedLesson.videoId && (
              <YouTube 
                videoId={selectedLesson.videoId} 
                className="w-full h-full" 
                iframeClassName="w-full h-full"
                onEnd={handleVideoEnd}
              />
            )}
          </div>
        );
      case 'resource':
        return (
          <Card className="bg-card overflow-hidden">
            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
              <div className="w-48 flex-shrink-0">
                <Image 
                  src="/images/devocional-2026-banner.jpg" // Usar a capa do devocional
                  alt="Capa do Livro Devocional 2026" 
                  width={300} 
                  height={450} 
                  className="rounded-lg shadow-lg" 
                  data-ai-hint="devotional book cover"
                />
              </div>
              <div className="flex flex-col items-center md:items-start">
                <h3 className="text-2xl font-bold text-foreground">{selectedLesson.title}</h3>
                <p className="text-muted-foreground mt-2">Material de Apoio Principal</p>
                <Button 
                  onClick={handleDownloadWatermarkedPdf} 
                  size="lg" 
                  className="mt-4"
                  disabled={isDownloading}
                >
                  {isDownloading ? 'Gerando...' : 'Baixar Livro em PDF'}
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  O livro será baixado com uma marca d'água personalizada com seu nome e email.
                </p>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return <p>Selecione uma aula para começar.</p>;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Cabeçalho fixo no topo */}
      <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden" variant="default">
            <span className="font-semibold">Menu</span>
          </SidebarTrigger>
          <Image 
            src="/images/logo4branco.fw.png" 
            alt="Livi Skov Logo" 
            width={40} 
            height={40} 
            className="" 
          />
          <h1 className="text-xl font-bold text-primary">
            {selectedLesson ? selectedLesson.title : devocionalCourseData.title}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden md:inline">
            {supabaseUser?.user_metadata?.first_name || supabaseUser?.email}
          </span>
        </div>
      </header>

      <Sidebar collapsible="icon" className="border-r pt-16"> {/* Adicionado pt-16 para compensar o cabeçalho fixo */}
        <SidebarHeader>
          <div className="flex items-center justify-center gap-4 p-2">
            <Image 
              src="/images/logo4branco.fw.png" 
              alt="Logo Livi Skov" 
              width={40} 
              height={40} 
              className="" 
              data-ai-hint="logo"
            />
            <span className="text-lg font-bold text-sidebar-foreground">Devocional 2026</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-0">
          <Accordion type="multiple" defaultValue={['devocional-intro']} className="w-full">
            {devocionalCourseData.modules.map((module) => {
              const moduleReleaseDate = module.releaseDate ? new Date(module.releaseDate) : null;
              const isModuleUnlocked = !moduleReleaseDate || currentTime >= moduleReleaseDate;
              
              return (
                <AccordionItem value={module.id} key={module.id} className="border-none">
                  <AccordionTrigger className="px-4 py-2 text-sm font-semibold text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground hover:no-underline">
                    {module.title}
                  </AccordionTrigger>
                  <AccordionContent className="pb-0 pl-3">
                    <ul className="flex flex-col gap-1 py-2 border-l border-sidebar-border ml-3">
                      {module.lessons.map((lesson) => {
                        const lessonReleaseDate = lesson.releaseDate ? new Date(lesson.releaseDate) : null;
                        const isLessonUnlocked = isModuleUnlocked && (!lessonReleaseDate || currentTime >= lessonReleaseDate);
                        const isLocked = !isLessonUnlocked;
                        const releaseDateFormatted = lessonReleaseDate ? 
                          new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(lessonReleaseDate) : '';
                        
                        const lessonButton = (
                          <button
                            onClick={() => !isLocked && handleLessonClick(lesson)}
                            disabled={isLocked}
                            className={cn(
                              "w-full text-left text-sm p-2 rounded-md flex items-center gap-3 transition-colors",
                              selectedLesson?.id === lesson.id 
                                ? 'bg-sidebar-accent text-sidebar-foreground font-semibold' 
                                : isLocked 
                                  ? 'cursor-not-allowed opacity-60' 
                                  : 'hover:bg-sidebar-accent'
                            )}
                          >
                            {isLocked ? (
                              <Lock className="h-4 w-4 flex-shrink-0" />
                            ) : lesson.type === 'video' ? (
                              <PlayCircle className="h-4 w-4 flex-shrink-0"/>
                            ) : (
                              <FileText className="h-4 w-4 flex-shrink-0" />
                            )}
                            <span className="flex-1 truncate">{lesson.title}</span>
                            {completionStatus[lesson.id] && <CheckCircle className="h-4 w-4 text-green-500" />}
                          </button>
                        );
                        
                        return (
                          <li key={lesson.id} className="px-2">
                            {isLocked && lessonReleaseDate ? (
                              <Tooltip>
                                <TooltipTrigger asChild>{lessonButton}</TooltipTrigger>
                                <TooltipContent>
                                  <p>Disponível em {releaseDateFormatted}</p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              lessonButton
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex flex-col gap-2 p-2">
            <Button variant="ghost" className="justify-start gap-2" asChild>
              <Link href="/courses">
                <Home className="h-4 w-4" />
                <span>Área de Membros</span>
              </Link>
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="justify-start gap-2">
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <main className={cn(
        "flex-1 p-4 md:p-6 lg:p-8 pt-20 transition-all duration-300 ease-in-out", // Adicionado pt-20 para compensar o cabeçalho fixo
        sidebar.state === 'expanded' ? "md:ml-[280px]" : "md:ml-16"
      )}>
        <div className="mx-auto max-w-4xl">
          {renderLessonContent()}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-primary">
              {selectedLesson?.subtitle || 'Sobre a aula'}
            </h2>
            <div className="mt-4 text-muted-foreground space-y-4 whitespace-pre-wrap">
              {selectedLesson?.description}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}