'use client';

import React from 'react';
import Image from 'next/image';
import YouTube from 'react-youtube';
import { Home, LogOut, BookOpen } from 'lucide-react';
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
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { DevocionalNavigation } from './devocional-navigation';

export interface DevocionalDailyLesson {
  id: string;
  title: string;
  type: 'video' | 'resource';
  subtitle?: string;
  description: string;
  videoId?: string;
  bookText?: string;
}

interface DevocionalDailyLayoutProps {
  selectedLesson: DevocionalDailyLesson | null;
  supabaseUser: User | null;
  completionStatus: Record<string, boolean>;
  handleLessonClick: (lesson: DevocionalDailyLesson) => void;
  handleVideoEnd: () => void;
  handleLogout: () => Promise<void>;
  sidebarContent: React.ReactNode;
}

export function DevocionalDailyLayout({
  selectedLesson,
  supabaseUser,
  completionStatus,
  handleLessonClick,
  handleVideoEnd,
  handleLogout,
  sidebarContent,
}: DevocionalDailyLayoutProps) {
  const sidebar = useSidebar();

  const renderVideoPlayer = () => {
    if (!selectedLesson?.videoId) return null;
    
    return (
      <div className="w-full max-w-md mx-auto lg:mx-0 lg:flex-1">
        <div className="relative rounded-lg overflow-hidden shadow-lg">
          {/* Vídeo limpo sem simulação de rede social */}
          <YouTube 
            videoId={selectedLesson.videoId} 
            className="w-full aspect-[9/16]" 
            iframeClassName="w-full h-full"
            onEnd={handleVideoEnd}
            opts={{
              playerVars: {
                modestbranding: 1,
                rel: 0,
                showinfo: 0
              }
            }}
          />
        </div>
      </div>
    );
  };

  const renderBookContent = () => {
    return (
      <div className="relative h-full">
        {/* Simulação de livro aberto */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg shadow-lg border border-amber-200">
          {/* Margem interna do livro */}
          <div className="h-full p-6 flex flex-col">
            {/* Cabeçalho do livro */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <BookOpen className="h-6 w-6 text-amber-600" />
                <h3 className="text-xl font-bold text-amber-800">{selectedLesson?.title}</h3>
              </div>
              <div className="h-px bg-amber-300 w-3/4 mx-auto"></div>
            </div>
            
            {/* Conteúdo do livro */}
            <div className="flex-1 overflow-y-auto">
              {!selectedLesson?.bookText ? (
                <div className="text-center py-12">
                  <p className="text-amber-700/80">Conteúdo do livro em desenvolvimento...</p>
                </div>
              ) : (
                <div className="text-amber-900 leading-relaxed">
                  <div className="text-center mb-8">
                    <h4 className="text-lg font-semibold mb-4">🎯 Reflexões do Dia</h4>
                    <div className="h-px bg-amber-300 w-1/2 mx-auto mb-4"></div>
                  </div>
                  <div className="whitespace-pre-wrap font-serif text-lg">
                    {selectedLesson.bookText}
                  </div>
                  
                  {/* Rodapé do livro */}
                  <div className="mt-8 pt-4 border-t border-amber-300 text-center text-sm text-amber-700/70">
                    <p>Devocional 2026 - Livi Skov</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Efeito de páginas */}
        <div className="absolute -right-1 top-0 bottom-0 w-2 bg-amber-800 rounded-r-lg opacity-20"></div>
      </div>
    );
  };

  return (
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
            />
            <span className="text-lg font-bold text-sidebar-foreground">Devocional 2026</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-0">
          {sidebarContent}
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
            {/* Botão do menu hamburguer para mobile */}
            <SidebarTrigger className="md:hidden" variant="default">
              <span className="font-semibold">Menu</span>
            </SidebarTrigger>
            <h1 className="text-xl font-bold text-primary">
              {selectedLesson ? selectedLesson.title : 'Devocional 2026'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:inline">
              {supabaseUser?.user_metadata?.first_name || supabaseUser?.email}
            </span>
          </div>
        </header>
        
        <main className={`p-4 md:p-6 lg:p-8 transition-all duration-300 ease-in-out ${sidebar.state === 'expanded' ? "md:ml-[280px]" : "md:ml-16"}`}>
          <div className="mx-auto max-w-7xl">
            {!selectedLesson ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Selecione um dia para começar o devocional.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
                {/* Coluna esquerda - Vídeo limpo */}
                <div className="flex justify-center lg:justify-end">
                  {selectedLesson.id.startsWith('day-') && renderVideoPlayer()}
                </div>
                
                {/* Coluna direita - Livro aberto */}
                <div className="h-[600px] relative">
                  {renderBookContent()}
                </div>
              </div>
            )}
            
            {selectedLesson && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-primary">
                  {selectedLesson.subtitle}
                </h2>
                <div className="mt-4 text-muted-foreground">
                  {selectedLesson.description}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}