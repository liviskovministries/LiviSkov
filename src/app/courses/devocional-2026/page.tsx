'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking, useUser } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useSupabaseAuth, useSupabaseUser } from '@/integrations/supabase/supabase-provider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DevocionalDailyLayout, DevocionalDailyLesson } from '@/components/devocional-daily-layout';
import { CourseLayout, Lesson, CourseData } from '@/components/course-layout';
import { DevocionalNavigation } from '@/components/devocional-navigation';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// Definindo o tipo UnifiedLesson que estava faltando
type UnifiedLesson = DevocionalDailyLesson & Lesson;

// Função para gerar as 31 aulas diárias com texto placeholder
const generateDailyLessons = (): UnifiedLesson[] => {
  const lessons: UnifiedLesson[] = [];
  for (let i = 1; i <= 31; i++) {
    const day = String(i).padStart(2, '0');
    const dayText = i === 1 ? 'Dia 01 - Um (Re)novo em Deus' : `Devocional - Dia ${day}`;
    const dayDescription = i === 1 
      ? 'Primeiro dia do devocional! Começamos nossa jornada de renovação e crescimento espiritual.' 
      : `Bem-vindo ao devocional do Dia ${day}! Hoje, vamos mergulhar na palavra e encontrar inspiração para sua jornada.`;
    
    // Texto limpo para o Dia 01
    const day01BookText = i === 1 ? `As misericórdias do SENHOR são a causa de não sermos consumidos, porque as suas misericórdias não têm fim; renovam-se cada manhã. Grande é a tua fidelidade.”
Lamentações 3:22–23 (ARA)` : `Texto do livro para o Dia ${day} será adicionado em breve.\n\nEste espaço conterá o conteúdo completo do devocional correspondente ao dia ${day}, incluindo reflexões, passagens bíblicas e perguntas para sua jornada espiritual.`;
    
    // Extrair o ID do vídeo para o Dia 01 da URL fornecida
    const videoId = i === 1 ? 'v2TBVoIbHrw' : 'Dc4EBMJXQgg';
    
    lessons.push({
      id: `day-${day}`,
      title: dayText,
      subtitle: `Dia ${day}`,
      type: 'video' as const,
      videoId: videoId,
      description: dayDescription,
      bookText: day01BookText
    });
  }
  return lessons;
};

// ... restante do código permanece igual ...
const devocionalCourseData: CourseData = {
  title: 'Devocional 2026',
  modules: [
    {
      id: 'devocional-content',
      title: 'Conteúdo do Devocional',
      lessons: [
        {
          id: 'devocional-pdf',
          title: 'Livro Um novo ano, um recomeço',
          type: 'resource' as const,
          subtitle: 'Sobre o Livro Um ano novo, recomeço',
          description: `Este devocional de 31 dias foi cuidadosamente preparado para guiar sua jornada espiritual ao longo de um mês completo de reflexão e crescimento.\n\n📖 O QUE VOCÊ ENCONTRARÁ NO LIVRO:\n\n• 31 devocionais diários com mensagens inspiradoras\n• Espaços para suas próprias reflexões e anotações\n• Passagens bíblicas selecionadas para cada tema\n• Perguntas que estimulam a introspecção\n\n🎯 COMO UTILIZAR:\n\nCada devocional foi pensado para ser acompanhado pelos vídeos correspondentes. Leia o texto do livro, assista o vídeo do dia, e depois volte ao livro para registrar suas reflexões e insights pessoais.\n\nEsta é uma jornada transformadora que combina a profundidade da leitura reflexiva com a dinâmica do conteúdo em vídeo, criando uma experiência completa de aprendizado espiritual.`
        },
        ...generateDailyLessons(),
      ],
    },
  ],
};

export default function Devocional2026Page() {
  // ... código restante permanece igual ...
}