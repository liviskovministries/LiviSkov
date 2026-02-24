'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface DevocionalLesson {
  id: string;
  title: string;
  type: 'video' | 'resource';
  subtitle?: string;
  description: string;
  videoId?: string;
}

interface DevocionalCalendarProps {
  lessons: DevocionalLesson[];
  selectedLessonId: string | null;
  completionStatus: Record<string, boolean>;
  onLessonClick: (lesson: DevocionalLesson) => void;
}

export function DevocionalCalendar({
  lessons,
  selectedLessonId,
  completionStatus,
  onLessonClick,
}: DevocionalCalendarProps) {
  // Filtrar apenas as lições que representam os dias do devocional (excluindo introdução/recurso)
  const dailyLessons = lessons.filter(lesson => lesson.id.startsWith('day-'));

  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-3 p-4 rounded-lg bg-secondary">
      {dailyLessons.map((lesson, index) => {
        const isCompleted = completionStatus[lesson.id];
        const isSelected = selectedLessonId === lesson.id;

        return (
          <Tooltip key={lesson.id}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "relative flex flex-col items-center justify-center h-20 w-full p-2 text-center text-sm font-semibold transition-colors",
                  "hover:bg-primary hover:text-primary-foreground",
                  isSelected && "bg-primary text-primary-foreground",
                  isCompleted && "border-green-500 ring-2 ring-green-500"
                )}
                onClick={() => onLessonClick(lesson)}
              >
                <span className="text-lg font-bold">{index + 1}</span>
                <span className="text-xs mt-1 opacity-80">Dia</span>
                {isCompleted && (
                  <CheckCircle className="absolute top-1 right-1 h-4 w-4 text-green-500" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{lesson.title}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}