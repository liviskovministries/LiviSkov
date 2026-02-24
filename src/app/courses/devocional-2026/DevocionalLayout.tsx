'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import YouTube from 'react-youtube';
import { Home, LogOut, PlayCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DevocionalCalendar } from '@/components/devocional-calendar'; // Importar o novo componente de calendário
import { User } from '@supabase/supabase-js';
import { cn } from '@/lib/utils'; // Importar cn

type Lesson = {
  id: string;
  title: string;
  type: 'video' | 'resource';
  subtitle?: string;
  description: string;
  videoId?: string;
};

interface DevocionalLayoutProps {
  selectedLesson: Lesson | null;
  courseData: {
    title: string;
    modules: Array<{
      id: string;
      title: string;
      lessons: Lesson[];
    }>;
  };
  supabaseUser: User | null;
  completionStatus: Record<string, boolean>;
  isDownloading: boolean;
  handleLessonClick: (lesson: Lesson) => void;
  handleVideoEnd: () => void;
  handleDownloadWatermarkedPdf: () => Promise<void>;
  handleLogout: () => Promise<void>;
}

export function DevocionalLayout({
  selectedLesson,
  courseData,
  supabaseUser,
  completionStatus,
  isDownloading,
  handleLessonClick,
  handleVideoEnd,
  handleDownloadWatermarkedPdf,
  handleLogout,
}: DevocionalLayoutProps) {

  const allLessons = courseData.modules.flatMap(module => module.lessons);
  const introLessons = courseData.modules.find(m => m.id === 'devocional-intro')?.lessons || [];
  const dailyLessons = courseData.modules.find(m => m.id === 'devocional-days')?.lessons || [];

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
    <div className="flex min-h-screen flex-col bg-background">
      {/* Cabeçalho */}
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
          <Button variant="ghost" onClick={handleLogout} className="justify-start gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Sair</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 pt-16 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          {/* Seção de Introdução e Livro */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {introLessons.map(lesson => (
              <Button
                key={lesson.id}
                variant="outline"
                className={cn(
                  "flex flex-col items-center justify-center h-32 text-center text-lg font-semibold",
                  selectedLesson?.id === lesson.id && "bg-primary text-primary-foreground"
                )}
                onClick={() => handleLessonClick(lesson)}
              >
                {lesson.type === 'video' ? (
                  <PlayCircle className="h-6 w-6 mb-2" />
                ) : (
                  <FileText className="h-6 w-6 mb-2" />
                )}
                {lesson.title}
              </Button>
            ))}
          </div>

          {/* Calendário de Aulas */}
          <h2 className="text-2xl font-bold text-primary mb-4">Dias do Devocional</h2>
          <DevocionalCalendar
            lessons={dailyLessons}
            selectedLessonId={selectedLesson?.id || null}
            completionStatus={completionStatus}
            onLessonClick={handleLessonClick}
          />

          {/* Conteúdo da Aula Selecionada */}
          <div className="mt-8">
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
        </div>
      </main>

      <footer className="border-t bg-background py-4 text-center text-sm text-muted-foreground">
        <div className="container flex items-center justify-between">
          <Link href="/courses" className="flex items-center gap-2 text-primary hover:underline">
            <Home className="h-4 w-4" />
            <span>Área de Membros</span>
          </Link>
          <p>&copy; {new Date().getFullYear()} Livi Skov. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}