'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import YouTube from 'react-youtube';
import { Home, LogOut, BookOpen, ChevronLeft, ChevronRight, Play } from 'lucide-react';
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

// Páginas do devocional para o Dia 01
const dia01Pages = [
  {
    content: `"As misericórdias do SENHOR são a causa de não sermos consumidos, porque as suas misericórdias não têm fim; renovam-se cada manhã. Grande é a tua fidelidade."
Lamentações 3:22–23 (ARA)

DEVOCIONAL

Renovo, como o próprio nome diz, é fazer novo — de novo. É quando o velho homem morre e renasce com Cristo. Mas também é quando mudamos de estação, de trabalho ou de direção, e precisamos começar algo novo do zero.

Muitas vezes, precisamos nos dar permissão para recomeçar. Para renovar, refazer e reconstruir. As misericórdias do Senhor nos dão essa chance todos os dias. Deus não nos chama para viver presos ao ontem, mas para confiar que hoje Ele está fazendo algo novo.

Existem coisas na nossa vida — como maus hábitos, mentiras e inseguranças — que precisam ser deixadas para trás. O renovo, às vezes, exige desapego. Cair e levantar faz parte do processo, e recomeçar não é sinal de fracasso, mas de coragem.`
  },
  {
    content: `Já a restauração é diferente.

Restauração é quando algo que foi quebrado não é descartado, mas cuidado com amor e intenção. Ninguém jogaria fora uma obra de Michelangelo só porque é antiga ou foi danificada. 

Pelo contrário, especialistas gastam tempo, recursos e delicadeza para remover camadas de sujeira e revelar novamente as cores originais do artista.

Restaurar é investir em algo que já esteve em sua glória. Se você sente que está desgastado, empoeirado ou quebrado, não ache que Deus vai te descartar. Ele é o Grande Restaurador.

Pense: o que na sua vida precisa de renovo? O que precisa de restauração?`
  }
];

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
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = dia01Pages.length;

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderVideoPlayer = () => {
    if (!selectedLesson?.videoId) return null;
    
    return (
      <div className="relative rounded-lg overflow-hidden bg-amber-50 border border-amber-200 shadow-lg">
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
        {/* Ícone decorativo no canto */}
        <div className="absolute top-4 right-4 bg-amber-600/20 rounded-full p-2">
          <Play className="h-4 w-4 text-amber-700" />
        </div>
      </div>
    );
  };

  const renderBookContent = () => {
    if (!selectedLesson?.id.startsWith('day-01')) {
      // Para outros dias, usar a versão padrão
      return (
        <div className="relative h-full">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg shadow-lg border border-amber-200">
            <div className="h-full p-8 flex flex-col">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <BookOpen className="h-8 w-8 text-amber-600" />
                  <h3 className="text-2xl font-bold text-amber-800">{selectedLesson?.title}</h3>
                </div>
                <div className="h-px bg-amber-300 w-3/4 mx-auto"></div>
              </div>
              
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
                  </div>
                )}
              </div>
              
              <div className="mt-8 pt-4 border-t border-amber-300 text-center text-sm text-amber-700/70">
                <p>Devocional 2026 - Livi Skov</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-1 top-0 bottom-0 w-2 bg-amber-800 rounded-r-lg opacity-20"></div>
        </div>
      );
    }

    // Para o Dia 01, usar o sistema de páginas integrado com vídeo
    return (
      <div className="relative h-full min-h-[800px]">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg shadow-lg border border-amber-200">
          <div className="h-full p-8 flex flex-col">
            {/* Cabeçalho do livro com navegação */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <BookOpen className="h-8 w-8 text-amber-600" />
                <h3 className="text-2xl font-bold text-amber-800">{selectedLesson?.title}</h3>
              </div>
              <div className="h-px bg-amber-300 w-3/4 mx-auto mb-4"></div>
              
              {/* Vídeo integrado no layout do livro */}
              <div className="mb-8 mx-auto max-w-2xl">
                {renderVideoPlayer()}
              </div>
              
              {/* Indicador de página */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className="h-10 w-10 text-amber-600 hover:text-amber-800 border border-amber-300"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                
                <span className="text-base text-amber-700 font-medium px-4 py-2 bg-amber-200/30 rounded-lg">
                  Página {currentPage + 1} de {totalPages}
                </span>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages - 1}
                  className="h-10 w-10 text-amber-600 hover:text-amber-800 border border-amber-300"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Conteúdo da página atual */}
            <div className="flex-1 overflow-y-auto">
              <div className="text-amber-900 leading-relaxed">
                <div className="text-center mb-8">
                  <h4 className="text-xl font-semibold mb-4">🎯 Reflexões do Dia</h4>
                  <div className="h-px bg-amber-300 w-1/2 mx-auto mb-6"></div>
                </div>
                <div className="whitespace-pre-wrap font-serif text-lg space-y-6 max-w-4xl mx-auto">
                  {dia01Pages[currentPage].content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-justify leading-8">
                      {paragraph}
                    </p>
                  ))}
                </div>
                
                {/* Pergunta reflexiva apenas na última página */}
                {currentPage === totalPages - 1 && (
                  <div className="mt-8 p-6 bg-amber-200/30 rounded-lg border border-amber-300 max-w-4xl mx-auto">
                    <h5 className="font-semibold text-amber-800 mb-3 text-lg">💭 Para refletir:</h5>
                    <p className="text-amber-700 italic text-base">
                      O que na sua vida precisa de renovo? O que precisa de restauração?
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Rodapé do livro */}
            <div className="mt-8 pt-6 border-t border-amber-300 text-center text-base text-amber-700/70">
              <p>Devocional 2026 - Livi Skov</p>
            </div>
          </div>
        </div>
        
        {/* Efeito de páginas */}
        <div className="absolute -right-1 top-0 bottom-0 w-3 bg-amber-800 rounded-r-lg opacity-20"></div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader>
          <div className="flex items-center justify-center gap-4 p-4">
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
          <div className="flex flex-col gap-2 p-4">
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
              <div className="min-h-[800px]">
                {/* Conteúdo do livro integrado com vídeo */}
                {renderBookContent()}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}