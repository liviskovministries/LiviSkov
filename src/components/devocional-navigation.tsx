'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, Lock, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface DevocionalDailyLesson {
  id: string;
  title: string;
  type: 'video' | 'resource';
  subtitle?: string;
  description: string;
  videoId?: string;
  bookText?: string;
}

interface DevocionalNavigationProps {
  lessons: DevocionalDailyLesson[];
  selectedLesson: DevocionalDailyLesson | null;
  completionStatus: Record<string, boolean>;
  handleLessonClick: (lesson: DevocionalDailyLesson) => void;
  currentTime: Date;
}

export function DevocionalNavigation({
  lessons,
  selectedLesson,
  completionStatus,
  handleLessonClick,
  currentTime,
}: DevocionalNavigationProps) {
  const downloadLesson = lessons.find(lesson => lesson.id === 'devocional-pdf');
  const dailyLessons = lessons.filter(lesson => lesson.id.startsWith('day-'));

  // Encontrar a lição de introdução a partir das props
  const introLesson = lessons.find(lesson => lesson.id === 'intro-devocional');

  if (!introLesson) {
    console.error("[DevocionalNavigation] Lição de introdução não encontrada nas props.");
    return null; // Ou renderizar um fallback apropriado
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Introdução ao Devocional */}
      <div className="mb-2 pb-2 border-b border-sidebar-border/30">
        <button
          onClick={() => handleLessonClick(introLesson)}
          className={cn(
            "w-full text-left text-sm p-3 rounded-md flex items-center gap-3 transition-colors",
            selectedLesson?.id === introLesson.id 
              ? 'bg-sidebar-accent text-sidebar-foreground font-semibold shadow-sm' 
              : 'hover:bg-sidebar-accent/20 text-sidebar-foreground/90 hover:text-sidebar-foreground'
          )}
        >
          {/* O ícone pode ser PlayCircle ou FileText, dependendo da preferência para 'resource' */}
          <PlayCircle className="h-5 w-5 flex-shrink-0" /> 
          <span className="flex-1 truncate font-bold text-base">{introLesson.title}</span>
          {completionStatus[introLesson.id] && <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />}
        </button>
      </div>

      {/* Download do Livro */}
      {downloadLesson && (
        <div className="mb-4 border-b pb-4 border-sidebar-border/30">
          <button
            onClick={() => handleLessonClick(downloadLesson)}
            className={cn(
              "w-full text-left text-sm p-3 rounded-md flex items-center gap-3 transition-colors",
              selectedLesson?.id === downloadLesson.id 
                ? 'bg-sidebar-accent text-sidebar-foreground font-semibold shadow-sm' 
                : 'hover:bg-sidebar-accent/20 text-sidebar-foreground/90 hover:text-sidebar-foreground'
            )}
          >
            <FileText className="h-5 w-5 flex-shrink-0" />
            <span className="flex-1 truncate font-bold">{downloadLesson.title}</span>
            {completionStatus[downloadLesson.id] && <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />}
          </button>
        </div>
      )}

      {/* Navegação tipo calendário para os dias */}
      <h3 className="text-lg font-semibold text-sidebar-foreground/90 mb-2">Devocional Diário</h3>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 31 }, (_, i) => i + 1).map(dayNum => {
          const lessonId = `day-${String(dayNum).padStart(2, '0')}`;
          const lesson = dailyLessons.find(l => l.id === lessonId);
          // Por enquanto, todas as aulas diárias são consideradas desbloqueadas
          const isLocked = false;
          const isCompleted = completionStatus[lessonId];

          const dayButton = (
            <Button
              key={lessonId}
              variant={selectedLesson?.id === lessonId ? 'default' : 'secondary'}
              size="icon"
              className={cn(
                "w-full h-10 transition-all duration-200",
                selectedLesson?.id === lessonId 
                  ? "bg-primary text-primary-foreground shadow-md scale-105" 
                  : "bg-sidebar-accent/10 hover:bg-sidebar-accent/30 text-sidebar-foreground border border-transparent hover:border-sidebar-border",
                isLocked && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => lesson && handleLessonClick(lesson)}
              disabled={isLocked}
            >
              {isCompleted ? (
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              ) : isLocked ? (
                <div className="flex items-center justify-center">
                  <Lock className="h-4 w-4" />
                </div>
              ) : (
                <span className="font-medium text-sm">
                  {String(dayNum).padStart(2, '0')}
                </span>
              )}
            </Button>
          );

          return (
            <div key={dayNum} className="flex flex-col items-center">
              {isLocked ? (
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>{dayButton}</TooltipTrigger>
                  <TooltipContent className="bg-background text-foreground border border-border">
                    <p>Em breve</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                dayButton
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}