'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking, useUser } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, SidebarTrigger, SidebarInset, SidebarGroup, SidebarGroupLabel, SidebarProvider, SidebarFooter, } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipTrigger, } from '@/components/ui/tooltip';
import { Home, BookOpen, LogOut, PlayCircle, FileText, CheckCircle, Lock, } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import YouTube from 'react-youtube';
import { useSupabaseAuth, useSupabaseUser } from '@/integrations/supabase/supabase-provider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Lesson = {
  id: string;
  title: string;
  type: 'video' | 'resource';
  content?: string;
  videoId?: string;
  subtitle?: string;
  description: string;
};

const courseData = {
  title: 'Curso Estações Espirituais',
  modules: [
    {
      id: 'modulo-0',
      title: 'Introdução',
      lessons: [
        {
          id: 'intro-1',
          title: 'Boas-vindas',
          type: 'video' as const,
          videoId: 'Dc4EBMJXQgg',
          subtitle: 'Boas-vindas ao Curso!',
          description: 'Bem-vinda ao curso Estações Espirituais! 🌿\n\nNeste módulo introdutório, você entenderá como as diferentes fases da vida refletem as estações do ano e como Deus trabalha em cada uma delas. Vou compartilhar minha jornada e como fui moldada por cada estação. Prepare-se para uma experiência de aprendizado e transformação. 🚀✨'
        },
        {
          id: 'intro-2',
          title: 'O que são as Estações Espirituais?',
          type: 'video' as const,
          videoId: 'Dc4EBMJXQgg',
          subtitle: 'Entendendo o Conceito',
          description: 'Este curso é uma jornada espiritual através das estações da minha vida. Assim como a natureza passa por mudanças, nossa caminhada com Deus também é marcada por períodos de crescimento, renúncia, desafios e renovações.\n\n🔍 O que você vai aprender?\n\n✔️ Como reconhecer a estação espiritual que está vivendo.\n✔️ Como abraçar cada fase com confiança.\n✔️ Como permitir que Deus fortaleça seu coração.\n\nQue esta caminhada traga clareza, esperança e transformação para sua vida! 🙏'
        },
        {
          id: 'intro-3',
          title: 'Livro Estações Espirituais',
          type: 'resource' as const,
          subtitle: 'Sobre o Livro de Apoio',
          description: 'Acesse e baixar o material de apoio principal do curso. Este livro è base da nossa jornada, aprofundando os temas abordados nas aulas e oferecendo exercícios práticos para cada estação.'
        },
      ],
    },
    {
      id: 'modulo-1',
      title: '🍂 Outono',
      releaseDate: '2026-02-04',
      lessons: [
        {
          id: 'outono-1',
          title: 'Aula 1: Outono',
          type: 'video' as const,
          videoId: 'QEx5SiEROtg',
          subtitle: '🍂 Outono – O Tempo de Soltar e Confiar',
          description: 'O outono é um tempo de transição e desapego. Algumas coisas que carregamos já não fazem sentido e precisamos confiar em Deus para deixá-las ir.\n\n💡 Reflexões para este módulo:\n\n🔸 O que Deus está me pedindo para abrir mão?\n🔸 Como posso confiar mais nele neste tempo?\n🔸 Quais mudanças preciso aceitar para crescer.\n\nO outono nos ensina que, para viver o novo, é preciso soltar o velho. Confie no processo! 🍁'
        },
      ],
    },
    {
      id: 'modulo-2',
      title: '❄️ Inverno',
      releaseDate: '2026-02-09',
      lessons: [
        {
          id: 'inverno-1',
          title: 'Aula 2: Inverno',
          type: 'video' as const,
          videoId: '1CZvtjsZ8_M',
          subtitle: '❄️ Inverno – Fortalecendo Raízes na Espera',
          description: 'O inverno espiritual é um tempo de espera, paciência e profundidade. Muitas vezes, nos sentimos isoladas, mas é nesse silêncio que Deus nos leva a um nível mais profundo com Ele.\n\n🔎 Dicas para enfrentar o inverno espiritual:\n\n✔️ Confie no tempo de Deus.\n✔️ Busque forças na oração e na Palavra.\n✔️ Entenda que a preparação acontece no silêncio.\n\nO inverno pode parecer longo, mas ele sempre precede um novo florescer. 🌨️'
        },
      ],
    },
    {
      id: 'modulo-3',
      title: '🌱 Primavera',
      releaseDate: '2026-02-11',
      lessons: [
        {
          id: 'prim-1',
          title: 'Aula 3: Primavera',
          type: 'video' as const,
          videoId: 'w4fnk9onusU',
          subtitle: '🌸 Primavera – O Florescer de uma Nova Temporada',
          description: 'A primavera espiritual é tempo de novidade e transformação! 🌷 Após uma longa fase de silêncio, Deus nos chama a despertar e crescer.\n\n🎯 Desafios da primavera:\n\n🌱 Sair da zona de conforto.\n🌱 Abraçar as novas oportunidades.\n🌱 Celebrar os pequenos avanços.\n\nNem sempre é fácil crescer, mas Deus nos fortalece para cada etapa. Abrace esse tempo de renovação! ✨'
        },
      ],
    },
    {
      id: 'modulo-5',
      title: '🔄 Transição',
      releaseDate: '2026-02-16',
      lessons: [
        {
          id: 'trans-1',
          title: 'Aula 4: Transição',
          type: 'video' as const,
          videoId: '5rt6pkMFD2E',
          subtitle: '🔄 Transição – Abraçando Mudanças e Novos Começos',
          description: 'A transição pode ser desafiadora, pois o antigo já não serve mais, mas o novo ainda não chegou completamente. É o momento de confiar que Deus está no controle e nos guiará para a próxima fase.\n\n🌟 Como lidar com a transição?\n\n✨ Mantenha a calma e confie em Deus.\n✨ Não tenha medo do novo.\n✨ Use esse tempo para se fortalecer.\n\nA transição pode parecer incerta, mas Deus já preparou o caminho para você! 💖'
        },
      ],
    },
    {
      id: 'modulo-4',
      title: '☀️ Verão',
      releaseDate: '2026-02-18',
      lessons: [
        {
          id: 'verao-1',
          title: 'Aula 5: Verão',
          type: 'video' as const,
          videoId: 'DewkwZFGMXY',
          subtitle: '☀️ Verão – A Colheita e o Impacto do Propósito',
          description: 'O verão espiritual é tempo de colheita e abundância!🌻 Após um longo processo de aprendizado, Deus nos leva a frutificar. É a hora de compartilhar, abençoar e viver a plenitude do chamado dele para nós.\n\n📌 O que aprender com o verão?\n\n✔️ Desfrutar dos frutos do esforço.\n✔️ Usar a bênção para abençoar outros.\n✔️ Permanecer firme no propósito de Deus.\n\nO verão é uma estação de alegria e responsabilidade. Que possamos viver esse tempo com gratidão e sabedoria! 🌞'
        },
      ],
    },
    {
      id: 'modulo-6',
      title: '🎉 Encerramento',
      releaseDate: '2026-02-23',
      lessons: [
        {
          id: 'enc-1',
          title: 'Live de Encerramento',
          type: 'video' as const,
          videoId: 'hfQRwqcqsxU',
          subtitle: 'GRANDE ENCONTRO FINAL – Aulão ao Vivo no Zoom! (Gravação)',
          description: 'Este foi o nosso último encontro, um momento de conexão e reflexão sobre tudo o que vivemos.\n\n💡 O que tivemos?\n\n✅ Compartilhamento de experiências.\n✅ Reflexões sobre cada estação.\n✅ Direcionamentos para o futuro.\n✅ Um tempo de comunhão e gratidão.\n\n🚀 Prepare-se para um GRANDE encerramento numa reunião maravilhosa no Zoom! 🎓🎊'
        },
      ],
    },
  ],
};

// URL assinada do PDF com token válido
const PDF_URL_SIGNED = 'https://rxvcxqfnkvqfxwzbujka.supabase.co/storage/v1/object/sign/Estacoes%20Espirituais/Livi-Skov-Estacoes-Espirituais.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80ODZlMTgxYy1kOWI4LTRkNTctYjY1ZS1iZWFkNzUxM2Q0ZTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJFc3RhY29lcyBFc3Bpcml0dWFpcy9MaXZpLVNrb3YtRXN0YWNvZXMtRXNwaXJpdHVhaXMucGRmIiwiaWF0IjoxNzY5NjEwNDEzLCJleHAiOjE4MDExNDY0MTN9.TqJJIDxZGw_hBF5lOEJaabbCoSnG8DOPphfDis6JvhQ';

export default function CoursePage() {
  const { user: firebaseUser, isUserLoading: isFirebaseUserLoading } = useUser();
  const { user: supabaseUser, isUserLoading: isSupabaseUserLoading } = useSupabaseUser();
  const supabaseAuth = useSupabaseAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(courseData.modules[0].lessons[0]);
  const [completionStatus, setCompletionStatus] = useState<Record<string, boolean>>({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  const courseId = 'estacoes-espirituais';

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
          .select('estacoes_espirituais_access')
          .eq('id', supabaseUser.id)
          .single();
        
        if (error) {
          console.error('Error checking Supabase user access:', error);
          setIsEnrolled(false);
        } else {
          setIsEnrolled(data?.estacoes_espirituais_access || false);
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
    if (lesson.type !== 'video') {
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
      const firstName = supabaseUser.user_metadata?.first_name || '';
      const lastName = supabaseUser.user_metadata?.last_name || '';
      const email = supabaseUser.email || '';

      console.log("[CoursePage] Downloading watermarked PDF for:", { firstName, lastName, email });
      console.log("[CoursePage] PDF URL:", PDF_URL_SIGNED);

      const response = await fetch('https://rxvcxqfnkvqfxwzbujka.supabase.co/functions/v1/watermark-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfUrl: PDF_URL_SIGNED,
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
      a.download = `Livi-Skov-Estacoes-Espirituais-${firstName}-${lastName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download concluído!",
        description: "Seu livro com marca d'água foi baixado com sucesso."
      });

    } catch (error: any) {
      console.error("[CoursePage] Error downloading watermarked PDF:", error);
      
      // Tentar fallback para download direto se a marca d'água falhar
      try {
        const directResponse = await fetch(PDF_URL_SIGNED);
        if (directResponse.ok) {
          const pdfBlob = await directResponse.blob();
          const url = window.URL.createObjectURL(pdfBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'Livi-Skov-Estacoes-Espirituais.pdf';
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          
          toast({
            title: "Download do PDF original concluído",
            description: "O livro foi baixado sem marca d'água devido a um erro no processamento."
          });
          return;
        }
      } catch (fallbackError: any) {
        console.error("[CoursePage] Fallback also failed:", fallbackError);
      }

      toast({
        variant: "destructive",
        title: "Erro no download",
        description: error.message || "Não foi possível baixar o livro. Tente novamente mais tarde."
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
                  src="/images/capa_livro_estacoes_espirituais.jpg" 
                  alt="Capa do Livro Estações Espirituais" 
                  width={300} 
                  height={450} 
                  className="rounded-lg shadow-lg" 
                  data-ai-hint="book cover"
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
        )
      default:
        return <p>Selecione uma aula para começar.</p>;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar collapsible="icon" className="border-r">
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
              <span className="text-lg font-bold text-sidebar-foreground">Estações Espirituais</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-0">
            <Accordion type="multiple" defaultValue={['modulo-0']} className="w-full">
              {courseData.modules.map((module) => {
                const releaseDate = module.releaseDate ? new Date(module.releaseDate) : null;
                const isModuleUnlocked = !releaseDate || currentTime >= releaseDate;
                
                return (
                  <AccordionItem value={module.id} key={module.id} className="border-none">
                    <AccordionTrigger className="px-4 py-2 text-sm font-semibold text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground hover:no-underline">
                      {module.title}
                    </AccordionTrigger>
                    <AccordionContent className="pb-0 pl-3">
                      <ul className="flex flex-col gap-1 py-2 border-l border-sidebar-border ml-3">
                        {module.lessons.map((lesson) => {
                          const isLocked = !isModuleUnlocked;
                          const releaseDateFormatted = releaseDate ? 
                            new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(releaseDate) : '';
                          
                          const lessonButton = (
                            <button
                              onClick={() => !isLocked && handleLessonClick(lesson)}
                              disabled={isLocked}
                              className={`w-full text-left text-sm p-2 rounded-md flex items-center gap-3 transition-colors ${
                                selectedLesson.id === lesson.id 
                                  ? 'bg-sidebar-accent text-sidebar-foreground font-semibold' 
                                  : isLocked 
                                    ? 'cursor-not-allowed opacity-60' 
                                    : 'hover:bg-sidebar-accent'
                              }`}
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
                              {isLocked && releaseDate ? (
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
                          )
                        })}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )
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
        <div className="flex-1">
          <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden"/>
              <h1 className="text-xl font-bold text-primary">
                {selectedLesson ? selectedLesson.title : courseData.title}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden md:inline">
                {supabaseUser?.user_metadata?.first_name || supabaseUser?.email}
              </span>
            </div>
          </header>
          <main className="p-4 md:p-6 lg:p-8">
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
      </div>
    </SidebarProvider>
  );
}