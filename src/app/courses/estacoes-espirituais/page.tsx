'use client';

import React, { useState, useEffect } from 'react';
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
    // ... restante dos módulos permanece o mesmo
  ],
};

const PDF_URL_SIGNED = 'https://rxvcxqfnkvqfxwzbujka.supabase.co/storage/v1/object/sign/Estacoes%20Espirituais/Livi-Skov-Estacoes-Espirituais.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80ODZlMTgxYy1kOWI4LTRkNTctYjY1ZS1iZWFkNzUxM2Q0ZTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJFc3RhY29lcyBFc3Bpcml0dWFpcy9MaXZpLVNrb3YtRXN0YWNvZXMtRXNwaXJpdHVhaXMucGRmIiwiaWF0IjoxNzY5NjEwNDEzLCJleHAiOjE4MDExNDY0MTN9.TqJJIDxZGw_hBF5lOEJaabbCoSnG8DOPphfDis6JvhQ';

export default function CoursePage() {
  const { user: supabaseUser, isUserLoading: isSupabaseUserLoading } = useSupabaseUser();
  const supabaseAuth = useSupabaseAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedLesson] = useState<Lesson>(courseData.modules[0].lessons[0]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentTime] = useState<Date>(new Date());
  
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
        );
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
                      <div className="flex flex-col gap-1 py-2 border-l border-sidebar-border ml-3">
                        {module.lessons.map((lesson) => {
                          const isLocked = !isModuleUnlocked;
                          
                          return (
                            <div key={lesson.id} className="px-2">
                              <button
                                onClick={() => !isLocked && {}}
                                disabled={isLocked}
                                className={`w-full text-left text-sm p-2 rounded-md flex items-center gap-3 transition-colors ${
                                  isLocked 
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
                              </button>
                            </div>
                          );
                        })}
                      </div>
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