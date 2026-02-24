'use client';

import React from 'react';
import Image from 'next/image';
import YouTube from 'react-youtube';
import { Home, LogOut } from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  useSidebar
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
        <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
          {/* Simulação de interface de rede social */}
          <div className="bg-gray-900 px-4 py-2 flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
            <div className="text-white text-sm font-medium">devotional.day</div>
          </div>
          
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
          
          {/* Rodapé da interface simulada */}
          <div className="bg-gray-900 px-4 py-3 text-white text-sm">
            <div className="flex gap-4 mb-2">
              <span>❤️</span>
              <span>💬</span>
              <span>↗️</span>
            </div>
            <div className="text-gray-400">Devocional do Dia - Livi Skov</div>
          </div>
        </div>
      </div>
    );
  };

  const renderBookContent = () => {
    if (!selectedLesson?.bookText) {
      return (
        <Card className="bg-card h-full">
          <CardContent className="p-6">
            <p className="text-muted-foreground text-center">Conteúdo do livro em desenvolvimento...</p>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card className="bg-card h-full">
        <CardContent className="p-6 h-full">
          <h3 className="text-xl font-bold text-foreground mb-4">{selectedLesson.title}</h3>
          <div className="prose prose-slate max-w-none text-foreground/90">
            <div className="whitespace-pre-wrap leading-relaxed">
              {selectedLesson.bookText}
            </div>
          </div>
        </CardContent>
      </Card>
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Coluna esquerda - Vídeo no formato de rede social */}
                <div className="flex justify-center lg:justify-end">
                  {renderVideoPlayer()}
                </div>
                
                {/* Coluna direita - Texto do livro */}
                <div className="lg:h-[600px] overflow-y-auto">
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