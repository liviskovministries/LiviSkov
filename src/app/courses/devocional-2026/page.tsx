'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking, useUser } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useSupabaseAuth, useSupabaseUser } from '@/integrations/supabase/supabase-provider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CourseLayout, Lesson, CourseData } from '@/components/course-layout';
import { DevocionalNavigation } from '@/components/devocional-navigation';
import { DevocionalBookLayout } from '@/components/devocional-book-layout';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button'; // Importando Button que estava faltando

// Adicionando dayNumber à interface Lesson temporariamente
interface DevocionalLesson extends Lesson {
  dayNumber?: number;
}

// Conteúdo do livro para cada dia (exemplo - você pode expandir com conteúdo real)
const bookContentByDay = {
  1: `Bem-vindo ao primeiro dia do seu devocional 2026!\n\nQue este ano seja marcado por renovação espiritual e crescimento contínuo na presença de Deus.\n\nLeitura sugerida: "
Eu crio novos céus e nova terra, e as coisas passadas não serão lembradas."`,
  2: `Dia 2 - Uma nova perspectiva\n\nComo podemos enxergar as situações com os olhos da fé?`,
  // ... continuar para os outros dias
};

const generateDailyLessons = () => {
  const lessons: DevocionalLesson[] = [];
  for (let i = 1; i <= 31; i++) {
    const day = String(i).padStart(2, '0');
    lessons.push({
      id: `day-${day}`,
      title: `Dia ${day}`,
      type: 'video',
      videoId: 'Dc4EBMJXQgg',
      subtitle: `Devocional do Dia ${day}`,
      description: `Bem-vindo ao devocional do Dia ${day}! Hoje, vamos mergulhar na palavra e encontrar inspiração para sua jornada.`,
      dayNumber: i
    });
  }
  return lessons;
};

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
          type: 'resource',
          subtitle: 'Sobre o Livro Um ano novo, recomeço',
          description: 'Baixe o livro completo em PDF para acompanhar os 31 dias de devocional.'
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
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(devocionalCourseData.modules[0].lessons[1]);
  const [completionStatus, setCompletionStatus] = useState<Record<string, boolean>>({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  const courseId = 'devocional-2026';
  const totalDays = 31;

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

  const handleLessonClick = (lesson: Lesson) => {
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

  const getCurrentDay = () => {
    if (selectedLesson?.id.startsWith('day-')) {
      return parseInt(selectedLesson.id.replace('day-', ''));
    }
    return 1;
  };

  const handlePreviousDay = () => {
    const currentDay = getCurrentDay();
    if (currentDay > 1) {
      const prevLesson = devocionalCourseData.modules[0].lessons.find(
        lesson => lesson.id === `day-${String(currentDay - 1).padStart(2, '0')}`
      );
      if (prevLesson) {
        handleLessonClick(prevLesson);
      }
    }
  };

  const handleNextDay = () => {
    const currentDay = getCurrentDay();
    if (currentDay < totalDays) {
      const nextLesson = devocionalCourseData.modules[0].lessons.find(
        lesson => lesson.id === `day-${String(currentDay + 1).padStart(2, '0')}`
      );
      if (nextLesson) {
        handleLessonClick(nextLesson);
      }
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
      description: "Seu livro com marca d'água está sendo gerado."
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
        description: "Seu livro com marca d'água foi baixado com sucesso."
      });

    } catch (error: any) {
      console.error("[Devocional2026Page] Error downloading watermarked PDF:", error);
      toast({
        variant: "destructive",
        title: "Erro no download",
        description: `Não foi possível baixar o livro. Por favor, tente novamente mais tarde. Detalhes: ${error.message}`
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

  const renderContent = () => {
    if (selectedLesson?.type === 'resource' || selectedLesson?.id === 'devocional-pdf') {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-primary mb-4">Livro Completo</h2>
            <p className="text-muted-foreground mb-6">
              Baixe o livro completo em PDF para acompanhar todos os 31 dias de devocional.
            </p>
            <Button 
              onClick={handleDownloadWatermarkedPdf} 
              size="lg" 
              disabled={isDownloading}
              className="gap-2"
            >
              {isDownloading ? 'Baixando...' : 'Baixar Livro Completo'}
            </Button>
          </div>
        </div>
      );
    }

    const currentDay = getCurrentDay();
    return (
      <DevocionalBookLayout
        currentDay={currentDay}
        totalDays={totalDays}
        videoId={selectedLesson?.videoId || 'Dc4EBMJXQgg'}
        bookContent={bookContentByDay[currentDay as keyof typeof bookContentByDay] || 'Conteúdo do dia em desenvolvimento...'}
        onPreviousDay={handlePreviousDay}
        onNextDay={handleNextDay}
        onVideoEnd={handleVideoEnd}
        onDownloadBook={handleDownloadWatermarkedPdf}
        isDownloading={isDownloading}
      />
    );
  };

  const allDevocionalLessons = useMemo(() => devocionalCourseData.modules[0].lessons, []);

  const devocionalSidebarContent = useMemo(() => (
    <DevocionalNavigation
      lessons={allDevocionalLessons}
      selectedLesson={selectedLesson}
      completionStatus={completionStatus}
      handleLessonClick={handleLessonClick}
      currentTime={currentTime}
    />
  ), [allDevocionalLessons, selectedLesson, completionStatus, handleLessonClick, currentTime]);

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

  return (
    <SidebarProvider>
      <CourseLayout
        selectedLesson={selectedLesson}
        courseData={devocionalCourseData}
        supabaseUser={supabaseUser}
        completionStatus={completionStatus}
        isDownloading={isDownloading}
        currentTime={currentTime}
        handleLessonClick={handleLessonClick}
        handleVideoEnd={handleVideoEnd}
        handleDownloadResource={handleDownloadWatermarkedPdf}
        handleLogout={handleLogout}
        courseLogoPath="/images/logo4branco.fw.png"
        resourceCoverPath={PlaceHolderImages.find(img => img.id === 'devocional-2026-cover')?.imageUrl || '/images/devocional-2026-banner.jpg'}
        sidebarContent={devocionalSidebarContent}
        customContent={renderContent()}
      />
    </SidebarProvider>
  );
}