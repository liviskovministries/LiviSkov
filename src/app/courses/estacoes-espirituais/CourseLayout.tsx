'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import YouTube from 'react-youtube';
import { Home, LogOut, PlayCircle, FileText, CheckCircle, Lock } from 'lucide-react';

import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  useSidebar
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { User } from '@supabase/supabase-js';

type Lesson = {
  id: string;
  title: string;
  type: 'video' | 'resource';
  subtitle?: string;
  description: string;
  videoId?: string;
};

interface CourseLayoutProps {
  selectedLesson: Lesson | null;
  courseData: {
    title: string;
    modules: Array<{
      id: string;
      title: string;
      releaseDate?: string;
      lessons: Lesson[];
    }>;
  };
  supabaseUser: User | null;
  completionStatus: Record<string, boolean>;
  isDownloading: boolean;
  currentTime: Date;
  handleLessonClick: (lesson: Lesson) => void;
  handleVideoEnd: () => void;
  handleDownloadWatermarkedPdf: () => Promise<void>;
  handleLogout: () => Promise<void>;
}

export function CourseLayout({
  selectedLesson,
  courseData,
  supabaseUser,
  completionStatus,
  isDownloading,
  currentTime,
  handleLessonClick,
  handleVideoEnd,
  handleDownloadWatermarkedPdf,
  handleLogout,
}: CourseLayoutProps) {
  const sidebar = useSidebar(); // useSidebar é chamado aqui, dentro do provedor

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
      {/* Cabeçalho simples */}
      <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center gap-4">
          <Image 
            src="/images/logo4branco.fw.png" 
            alt="Livi Skov Logo" 
            width={40} 
            height={40} 
            className="" 
          />
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

      <div className="flex w-full pt-16"> 
        <Sidebar collapsible="icon" className="border-r">
          <SidebarHeader>
            <div className="flex items-center justify-center gap-4 p-2">
              <Image 
                src="/images/logo4branco.fw.png" 
                alt="Logo Livi Skov" 
                width={40} 
                height={40} 
                className="" 
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
                                selectedLesson?.id === lesson.id 
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
        <main className={`flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 ease-in-out ${
          sidebar.state === 'expanded' ? "md:ml-[280px]" : "md:ml-16"
        }`}>
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
  );
}