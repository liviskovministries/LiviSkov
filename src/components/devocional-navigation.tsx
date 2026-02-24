'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, Lock } from 'lucide-react';
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

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Download do Livro */}
      {downloadLesson && (
        <div className="mb-4">
          <button
            onClick={() => handleLessonClick(downloadLesson)}
            className={cn(
              "w-full text-left text-sm p-3 rounded-md flex items-center gap-3 transition-colors",
              selectedLesson?.id === downloadLesson.id 
                ? 'bg-sidebar-accent text-sidebar-foreground font-semibold' 
                : 'hover:bg-sidebar-accent text-sidebar-foreground/70'
            )}
          >
            <FileText className="h-5 w-5 flex-shrink-0" />
            <span className="flex-1 truncate font-bold">{downloadLesson.title}</span>
            {completionStatus[downloadLesson.id] && <CheckCircle className="h-5 w-5 text-green-500" />}
          </button>
        </div>
      )}

      {/* Navegação tipo calendário para os dias */}
      <h3 className="text-lg font-semibold text-sidebar-foreground/90 mb-2">Devocional Diário</h3>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 31 }, (_, i) => i + 1).map(dayNum => {
          const lessonId = `day-${String(dayNum).padStart(2, '0')}`;
          const lesson = dailyLessons.find(l => l.id === lessonId);
          const isLocked = false; // Todos os dias estão desbloqueados por enquanto
          const isCompleted = completionStatus[lessonId];

          const dayButton = (
            <Button
              key={lessonId}
              variant={selectedLesson?.id === lessonId ? 'default' : 'ghost'}
              size="icon"
              className={cn(
                "w-full h-10 text-sidebar-foreground",
                selectedLesson?.id === lessonId ? "bg-sidebar-accent hover:bg-sidebar-accent/80" : "hover:bg-sidebar-accent/20",
                isLocked && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => lesson && handleLessonClick(lesson)}
              disabled={isLocked}
            >
              {isCompleted ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : isLocked ? (
                <Lock className="h-4 w-4" />
              ) : (
                String(dayNum).padStart(2, '0')
              )}
            </Button>
          );

          return (
            <div key={dayNum}>
              {isLocked ? (
                <Tooltip>
                  <TooltipTrigger asChild>{dayButton}</TooltipTrigger>
                  <TooltipContent>
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