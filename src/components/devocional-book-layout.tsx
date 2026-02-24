'use client';

import React from 'react';
import Image from 'next/image';
import YouTube from 'react-youtube';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Download, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface DevocionalBookLayoutProps {
  currentDay: number;
  totalDays: number;
  videoId: string;
  bookContent: string;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onVideoEnd?: () => void;
  onDownloadBook: () => Promise<void>;
  isDownloading?: boolean;
}

export function DevocionalBookLayout({
  currentDay,
  totalDays,
  videoId,
  bookContent,
  onPreviousDay,
  onNextDay,
  onVideoEnd,
  onDownloadBook,
  isDownloading = false
}: DevocionalBookLayoutProps) {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = React.useState(false);

  const handleDownloadBook = async () => {
    try {
      await onDownloadBook();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro no download",
        description: "Não foi possível baixar o livro completo."
      });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      {/* Coluna Esquerda - Vídeo */}
      <div className="flex-1 min-w-0">
        <div className="bg-card rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-primary">Vídeo - Dia {currentDay}</h2>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onPreviousDay}
                disabled={currentDay <= 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dia {currentDay - 1}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onNextDay}
                disabled={currentDay >= totalDays}
              >
                Dia {currentDay + 1}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
          
          <div className="aspect-video rounded-lg overflow-hidden bg-black">
            {videoId && (
              <YouTube 
                videoId={videoId} 
                className="w-full h-full" 
                iframeClassName="w-full h-full"
                onEnd={onVideoEnd}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Coluna Direita - Livro Digital */}
      <div className="flex-1 min-w-0">
        <div className="bg-card rounded-lg shadow-lg overflow-hidden h-full">
          {/* Capa do livro */}
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-primary">Devocional 2026</h2>
                <p className="text-lg text-muted-foreground">Um novo ano, um recomeço</p>
              </div>
              <Button 
                onClick={handleDownloadBook}
                disabled={isDownloading}
                className="gap-2"
                variant="outline"
              >
                <Download className="h-4 w-4" />
                {isDownloading ? 'Baixando...' : 'Livro Completo'}
              </Button>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Dia {currentDay} de {totalDays}
            </div>
          </div>

          {/* Conteúdo do livro */}
          <div className="p-6">
            <div className="bg-white rounded-lg border shadow-sm min-h-[400px]">
              {/* Cabeçalho da página do livro */}
              <div className="border-b p-4 bg-gradient-to-r from-primary/5 to-transparent">
                <h3 className="text-xl font-semibold text-primary">
                  Dia {currentDay} - Devocional Diário
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Assista o vídeo ao lado e continue sua leitura aqui
                </p>
              </div>

              {/* Texto do livro */}
              <div className="p-6 prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap leading-relaxed text-foreground">
                  {bookContent || (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>Comece assistindo o vídeo para acessar o conteúdo deste dia.</p>
                      <p className="text-sm mt-2">
                        {isPlaying 
                          ? "Vídeo em andamento..." 
                          : "Clique em reproduzir para começar"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Rodapé da página */}
              <div className="border-t p-4 flex justify-between items-center text-xs text-muted-foreground">
                <span>© Livi Skov - Devocional 2026</span>
                <span>Página {currentDay}</span>
              </div>
            </div>
          </div>

          {/* Navegação inferior */}
          <div className="border-t p-4 bg-muted/10">
            <div className="flex justify-between items-center">
              <Button 
                variant="outline" 
                onClick={onPreviousDay}
                disabled={currentDay <= 1}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Dia Anterior
              </Button>
              
              <div className="text-sm text-muted-foreground">
                Progresso: {currentDay} de {totalDays} dias
              </div>
              
              <Button 
                variant="outline" 
                onClick={onNextDay}
                disabled={currentDay >= totalDays}
                className="gap-2"
              >
                Próximo Dia
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}