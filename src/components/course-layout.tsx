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
  useSidebar,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { User } from '@supabase/supabase-js';

export type Lesson = {
  id: string;
  title: string;
  type: 'video' | 'resource' | 'content';
  subtitle?: string;
  description: string;
  videoId?: string;
  coverImageId?: string; // Adicionado coverImageId aqui
};

export interface CourseData {
  title: string;
  modules: Array<{
    id: string;
    title: string;
    releaseDate?: string;
    lessons: Lesson[];
  }>;
}

interface CourseLayoutProps {
  selectedLesson: Lesson | null;
  courseData: CourseData;
  supabaseUser: User | null;
  completionStatus: Record<string, boolean>;
  isDownloading: boolean;
  currentTime: Date;
  handleLessonClick: (lesson: Lesson) => void;
  handleVideoEnd: () => void;
  handleDownloadResource: () => Promise<void>;
  handleLogout: () => Promise<void>;
  courseLogoPath: string;
  resourceCoverPath?: string;
  sidebarContent: React.ReactNode; // Nova prop para o conteúdo da sidebar
  introImageComponent?: React.ReactNode; // Nova prop para a imagem de introdução no conteúdo principal
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
  handleDownloadResource,
  handleLogout,
  courseLogoPath,
  resourceCoverPath,
  sidebarContent, // Destruturar a nova prop
  introImageComponent, // Destruturar a nova prop
}: CourseLayoutProps) {
  const sidebar = useSidebar();

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
              {resourceCoverPath && (
                <div className="w-48 flex-shrink-0">
                  <Image 
                    src={resourceCoverPath} 
                    alt={`Capa do Livro ${courseData.title}`} 
                    width={300} 
                    height={450} 
                    className="rounded-lg shadow-lg" 
                    data-ai-hint="book cover"
                  />
                </div>
              )}
              <div className="flex flex-col items-center md:items-start">
                <h3 className="text-2xl font-bold text-foreground">{selectedLesson.title}</h3>
                <p className="text-muted-foreground mt-2">Material de Apoio Principal</p>
                <Button 
                  onClick={handleDownloadResource} 
                  size="lg" 
                  className="mt-4"
                  disabled={isDownloading}
                >
                  {isDownloading ? 'Gerando...' : 'Baixar Material em PDF'}
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  O material será baixado com uma marca d'água personalizada com seu nome e email.
                </p>
              </div>
            </CardContent>
          </Card>
        );
      case 'content': // Novo tipo 'content'
        return null; // Não renderiza nada aqui, o texto é renderizado abaixo
      default:
        return <p>Selecione uma aula para começar.</p>;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader>
          <div className="flex items-center justify-center gap-4 p-2">
            <Image 
              src={courseLogoPath} 
              alt={`Logo ${courseData.title}`} 
              width={40} 
              height={40} 
              className="" 
              data-ai-hint="logo"
            />
            <span className="text-lg font-bold text-sidebar-foreground">{courseData.title}</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-0">
          {sidebarContent} {/* Renderiza o conteúdo da sidebar passado via prop */}
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
            <SidebarTrigger className="md:hidden" variant="default">
              <span className="font-semibold">Menu</span>
            </SidebarTrigger>
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
            {/* Renderiza a imagem de introdução aqui, se for a lição de introdução */}
            {selectedLesson?.id === 'intro-devocional' && introImageComponent}

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