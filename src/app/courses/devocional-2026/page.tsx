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
import { DevocionalNavigation } from '@/components/devocional-navigation';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// Criando um tipo unificado que pode ser usado em ambos os layouts
type UnifiedLesson = DevocionalDailyLesson & {
  type: 'video' | 'resource';
};

// Função para gerar as 31 aulas diárias com texto placeholder
const generateDailyLessons = (): UnifiedLesson[] => {
  const lessons: UnifiedLesson[] = [];
  for (let i = 1; i <= 31; i++) {
    const day = String(i).padStart(2, '0');
    lessons.push({
      id: `day-${day}`,
      title: `Devocional - Dia ${day}`,
      type: 'video' as const,
      subtitle: `Dia ${day}: Um novo recomeço`,
      description: `Bem-vindo ao devocional do Dia ${day}! Hoje, vamos mergulhar na palavra e encontrar inspiração para sua jornada.`,
      videoId: 'Dc4EBMJXQgg',
      bookText: `Texto do livro para o Dia ${day} será adicionado em breve.\n\nEste espaço conterá o conteúdo completo do devocional correspondente ao dia ${day}, incluindo reflexões, passagens bíblicas e perguntas para sua jornada espiritual.`
    });
  }
  return lessons;
};

const devocionalCourseData = {
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
          description: `Este devocional de 31 dias foi cuidadosamente preparado para guiar sua jornada espiritual ao longo de um mês completo de reflexão e crescimento.`,
        },
        ...generateDailyLessons(),
      ],
    },
  ],
};

export default function Devocional2026Page() {
  const { user: firebaseUser, isUserLoading: isFirebaseUserLoading } = useUser();
  const { user: supabaseUser, isUserLoading: isSupabaseUserLoading } = useSupabaseUser();
  const supabaseAuth = useSupabaseAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedLesson, setSelectedLesson] = useState<UnifiedLesson | null>(devocionalCourseData.modules[0].lessons[0] as UnifiedLesson);
  const [completionStatus, setCompletionStatus] = useState<Record<string, boolean>>({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  const courseId = 'devocional-2026';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const progressDocRef = useMemoFirebase(() => {
    if (!firebaseUser || !firestore) return null;
    return doc(firestore, 'users', firebaseUser.uid, 'courseProgress', courseId);
  }, [firebaseUser, firestore]);

  const { data: progressData, isLoading: progressLoading } = useDoc<{ completedLessons: Record<string, boolean> }>(progressDocRef);

  useEffect(() => {
    if (progressData?.completedLessons) {
      setCompletionStatus(progressData.completedLessons);
    }
  }, [progressData]);

  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      if (!supabaseUser) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('devocional_2026_access')
          .eq('id', supabaseUser.id)
          .single();
        
        if (error) {
          console.error('Error checking Supabase user access:', error);
          setIsEnrolled(false);
        } else {
          setIsEnrolled(data?.devocional_2026_access || false);
        }
      } catch (error) {
        console.error('Error checking enrollment status:', error);
        setIsEnrolled(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkEnrollmentStatus();
  }, [supabaseUser]);

  useEffect(() => {
    if (!isSupabaseUserLoading && !supabaseUser) {
      router.push('/login');
    }
    
    if (!isSupabaseUserLoading && supabaseUser && !isLoading && !isEnrolled) {
      router.push('/courses');
    }
  }, [supabaseUser, isSupabaseUserLoading, router, isEnrolled, isLoading]);

  const markLessonAsComplete = (lessonId: string) => {
    if (!progressDocRef || completionStatus[lessonId]) return;
    
    const newStatus = {
      ...completionStatus,
      [lessonId]: true
    };
    
    setCompletionStatus(newStatus);
    
    setDocumentNonBlocking(progressDocRef, {
      id: courseId,
      completedLessons: newStatus
    }, { merge: true });
  };

  const handleLessonClick = (lesson: UnifiedLesson) => {
    setSelectedLesson(lesson);
    if (lesson.type !== 'video') {
      markLessonAsComplete(lesson.id);
    }
  };

  const handleVideoEnd = () => {
    if (selectedLesson?.type === 'video') {
      markLessonAsComplete(selectedLesson.id);
    }
  };

  const handleDownloadWatermarkedPdf = async () => {
    if (!supabaseUser) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você precisa estar logado para baixar o material."
      });
      router.push('/login');
      return;
    }

    setIsDownloading(true);
    toast({
      title: "Preparando download...",
      description: "Seu material com marca d'água está sendo gerado."
    });

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('first_name, last_name, email')
        .eq('id', supabaseUser.id)
        .single();

      if (profileError || !profileData) {
        console.error('Error fetching user profile from public.users:', profileError);
        throw new Error('Não foi possível obter os dados do seu perfil para o download.');
      }

      const firstName = profileData.first_name || '';
      const lastName = profileData.last_name || '';
      const email = profileData.email || '';

      console.log("[Devocional2026Page] Downloading watermarked PDF for:", { firstName, lastName, email });

      const response = await fetch('https://rxvcxqfnkvqfxwzbujka.supabase.co/functions/v1/watermark-devocional-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const pdfBlob = await response.blob();
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Livi-Skov-Devocional-2026-${firstName}-${lastName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download concluído!",
        description: "Seu material com marca d'água foi baixado com sucesso."
      });

    } catch (error: any) {
      console.error("[Devocional2026Page] Error downloading watermarked PDF:", error);
      
      toast({
        variant: "destructive",
        title: "Erro no download",
        description: `Não foi possível baixar o material. Por favor, tente novamente mais tarde. Detalhes: ${error.message}`
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabaseAuth.signOut();
    if (error) {
      console.error("Erro ao fazer logout:", error.message);
    } else {
      router.push('/');
    }
  };

  // Identificar se é uma aula de vídeo (dias 01-31)
  const isDailyLesson = selectedLesson?.id.startsWith('day-');

  // Funções para navegação entre os dias
  const getCurrentDayIndex = () => {
    if (!selectedLesson || !isDailyLesson) return -1;
    return devocionalCourseData.modules[0].lessons.findIndex(lesson => lesson.id === selectedLesson.id);
  };

  const hasNextLesson = () => {
    const currentIndex = getCurrentDayIndex();
    return currentIndex > -1 && currentIndex < devocionalCourseData.modules[0].lessons.length - 1;
  };

  const hasPreviousLesson = () => {
    const currentIndex = getCurrentDayIndex();
    return currentIndex > 1; // Começa do índice 1 (depois do download do livro)
  };

  const goToNextLesson = () => {
    const currentIndex = getCurrentDayIndex();
    if (hasNextLesson()) {
      const nextLesson = devocionalCourseData.modules[0].lessons[currentIndex + 1] as UnifiedLesson;
      handleLessonClick(nextLesson);
    }
  };

  const goToPreviousLesson = () => {
    const currentIndex = getCurrentDayIndex();
    if (hasPreviousLesson()) {
      const prevLesson = devocionalCourseData.modules[0].lessons[currentIndex - 1] as UnifiedLesson;
      handleLessonClick(prevLesson);
    }
  };

  // Conteúdo da sidebar para o Devocional 2026
  const devocionalSidebarContent = useMemo(() => (
    <DevocionalNavigation
      lessons={devocionalCourseData.modules[0].lessons}
      selectedLesson={selectedLesson}
      completionStatus={completionStatus}
      handleLessonClick={handleLessonClick}
      currentTime={currentTime}
    />
  ), [devocionalCourseData.modules[0].lessons, selectedLesson, completionStatus, handleLessonClick, currentTime]);

  // Retornos condicionais
  if (isSupabaseUserLoading || !supabaseUser || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!isEnrolled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Verificando acesso...</p>
      </div>
    );
  }

  // Usar o layout específico para dias 01-31
  if (isDailyLesson) {
    return (
      <SidebarProvider>
        <DevocionalDailyLayout
          selectedLesson={selectedLesson}
          supabaseUser={supabaseUser}
          completionStatus={completionStatus}
          handleLessonClick={handleLessonClick}
          handleVideoEnd={handleVideoEnd}
          handleLogout={handleLogout}
          sidebarContent={devocionalSidebarContent}
          onNextLesson={goToNextLesson}
          onPreviousLesson={goToPreviousLesson}
          hasNextLesson={hasNextLesson()}
          hasPreviousLesson={hasPreviousLesson()}
        />
      </SidebarProvider>
    );
  }

  // Para o download do livro, usar o layout diferente
  const selectedLessonAsLesson = selectedLesson;
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <div className="flex-1">
          <div className="p-8 text-center">
            <h1 className="text-3xl font-bold text-primary">{selectedLesson?.title}</h1>
            <p className="mt-4 text-muted-foreground">{selectedLesson?.description}</p>
            <button 
              onClick={handleDownloadWatermarkedPdf}
              className="mt-6 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              disabled={isDownloading}
            >
              {isDownloading ? 'Gerando...' : 'Baixar Livro em PDF'}
            </button>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}