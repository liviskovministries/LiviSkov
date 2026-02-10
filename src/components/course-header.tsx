'use client';

import React from 'react';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { User } from '@supabase/supabase-js';

// Definir o tipo Lesson aqui ou importar de outro lugar se for um tipo global
// Para evitar dependência circular, vou definir uma versão simplificada aqui.
// No arquivo original, você pode importar o tipo Lesson diretamente.
type Lesson = {
  id: string;
  title: string;
  type: 'video' | 'resource';
  subtitle?: string;
  description: string;
  videoId?: string;
};

interface CourseHeaderProps {
  selectedLesson: Lesson | null;
  courseTitle: string;
  supabaseUser: User | null;
}

export function CourseHeader({ selectedLesson, courseTitle, supabaseUser }: CourseHeaderProps) {
  // O hook useSidebar é chamado aqui, dentro de um componente que sempre será renderizado
  // dentro do SidebarProvider, resolvendo o erro de ordem dos hooks.
  const { isOpen } = useSidebar();

  return (
    <header className={`fixed top-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 transition-all duration-300 ease-in-out ${
      isOpen ? "md:left-[280px]" : "md:left-16" // Ajusta a posição left no desktop
    }`}>
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Abrir menu</span>
        </SidebarTrigger>
        <h1 className="text-xl font-bold text-primary">
          {selectedLesson ? selectedLesson.title : courseTitle}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground hidden md:inline">
          {supabaseUser?.user_metadata?.first_name || supabaseUser?.email}
        </span>
      </div>
    </header>
  );
}