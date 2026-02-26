'use client';

import React from 'react';
import Image from 'next/image';
import YouTube from 'react-youtube';
import { Home, LogOut, Heart, Share2, MessageCircle, BookOpen } from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  useSidebar,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { DevocionalNavigation } from './devocional-navigation';

export interface DevocionalDailyLesson {
  id: string;
  title: string;
  type: 'video' | 'resource' | 'content'; // Adicionado o tipo 'content'
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

  const renderSocialMediaVideo = () => {
    if (!selectedLesson?.videoId) return null;
    
    return (
      <div className="w-full flex justify-center">
        <div className="max-w-sm mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header do post */}
          <div className="flex items-center p-4 border-b">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="ml-3">
              <h4 className="font-semibold text-gray-900">Livi Skov</h4>
              <p className="text-sm text-gray-500">Devocional 2026</p>
            </div>
            <div className="ml-auto">
              <span className="text-xs text-gray-500">Hoje</span>
            </div>
          </div>
          
          {/* Vídeo */}
          <div className="w-full aspect-[9/16] bg-black">
            <YouTube 
              videoId={selectedLesson.videoId} 
              className="w-full h-full" 
              iframeClassName="w-full h-full"
              onEnd={handleVideoEnd}
              opts={{
                playerVars: {
                  modestbranding: 1,
                  rel: 0,
                  showinfo: 0,
                  controls: 1
                }
              }}
            />
          </div>
          
          {/* Ações do post */}
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-red-500">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-blue-500">
                  <MessageCircle className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-green-500">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
              <div className="text-xs text-gray-500">
                {Math.floor(Math.random() * 1000) + 100} visualizações
              </div>
            </div>
            
            {/* Descrição */}
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-900">Livi Skov</p>
              <p className="text-gray-700 text-sm mt-1">{selectedLesson.description}</p>
              <p className="text-gray-500 text-xs mt-2">#Devocional2026 #Renovação #Deus</p>
            </div>
          </div>
        </div>
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
        
        <main className="p-4 md:p-6 lg:p-8">
          <div className="w-full flex justify-center">
            {!selectedLesson ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Selecione um dia para começar o devocional.</p>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                {/* Vídeo estilo rede social */}
                {selectedLesson.type === 'video' && renderSocialMediaVideo()}
                {/* Se for tipo 'content', apenas o description será renderizado abaixo */}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}