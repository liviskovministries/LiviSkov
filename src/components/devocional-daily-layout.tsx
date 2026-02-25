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
      <div className="w-full max-w-md mx-auto lg:max-w-none">
        <div className="bg-black rounded-lg overflow-hidden shadow-lg">
          <YouTube 
            videoId={selectedLesson.videoId} 
            className="w-full aspect-video" 
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

  const renderContent = () => {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          {!selectedLesson?.bookText ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Conteúdo em desenvolvimento...</p>
            </div>
          ) : (
            <div className="prose prose-lg max-w-none">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-primary">{selectedLesson?.title}</h3>
                <div className="h-px bg-border w-1/4 mx-auto mt-4"></div>
              </div>
              <div className="leading-relaxed text-foreground whitespace-pre-wrap">
                {selectedLesson.bookText}
              </div>
              <div className="mt-8 pt-4 border-t border-border text-center text-sm text-muted-foreground">
                <p>Devocional 2026 - Livi Skov</p>
              </div>
            </div>
          )}
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
        
        <main className="p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-4xl">
            {!selectedLesson ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Selecione um dia para começar o devocional.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Vídeo */}
                {selectedLesson.type === 'video' && renderVideoPlayer()}
                
                {/* Conteúdo do livro */}
                {renderContent()}
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