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

// Criando um tipo unificado que pode ser usado em ambos os layouts
type UnifiedLesson = DevocionalDailyLesson & Lesson;

// Função para gerar as 31 aulas diárias com texto placeholder
const generateDailyLessons = (): UnifiedLesson[] => {
  const lessons: UnifiedLesson[] = [];
  for (let i = 1; i <= 31; i++) {
    const day = String(i).padStart(2, '0');
    const dayText = i === 1 ? 'Dia 01 - Um (Re)novo em Deus' : `Devocional - Dia ${day}`;
    const dayDescription = i === 1 
      ? '' // Removido o texto descritivo para o Dia 01
      : `Bem-vindo ao devocional do Dia ${day}! Hoje, vamos mergulhar na palavra e encontrar inspiração para sua jornada.`;
    
    // Extrair o ID do vídeo para o Dia 01 da URL fornecida
    const videoId = i === 1 ? 'v2TBVoIbHrw' : 'Dc4EBMJXQgg';
    
    lessons.push({
      id: `day-${day}`,
      title: dayText,
      subtitle: `Dia ${day}`,
      type: 'video' as const,
      videoId: videoId,
      description: dayDescription,
      bookText: `Texto do livro para o Dia ${day} será adicionado em breve.\n\nEste espaço conterá o conteúdo completo do devocional correspondente ao dia ${day}, incluindo reflexões, passagens bíblicas e perguntas para sua jornada espiritual.`
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

  // Identificar se é o Dia 01 específicamente
  const isDay01 = selectedLesson?.id === 'day-01';

  // Conversão segura para tipos específicos
  const lessonsAsDevocionalType: DevocionalDailyLesson[] = devocionalCourseData.modules[0].lessons.map(lesson => ({
    ...lesson,
    bookText: (lesson as any).bookText || ''
  }));

  const selectedLessonAsDevocional: DevocionalDailyLesson | null = selectedLesson ? {
    ...selectedLesson,
    bookText: (selectedLesson as any).bookText || ''
  } : null;

  // Conteúdo da sidebar para o Devocional 2026
  const devocionalSidebarContent = useMemo(() => (
    <DevocionalNavigation
      lessons={lessonsAsDevocionalType}
      selectedLesson={selectedLessonAsDevocional}
      completionStatus={completionStatus}
      handleLessonClick={handleLessonClick}
      currentTime={currentTime}
    />
  ), [lessonsAsDevocionalType, selectedLessonAsDevocional, completionStatus, handleLessonClick, currentTime]);

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

  // Usar o layout específico APENAS para o Dia 01
  if (isDay01) {
    return (
      <SidebarProvider>
        <DevocionalDailyLayout
          selectedLesson={selectedLessonAsDevocional}
          supabaseUser={supabaseUser}
          completionStatus={completionStatus}
          handleLessonClick={handleLessonClick}
          handleVideoEnd={handleVideoEnd}
          handleLogout={handleLogout}
          sidebarContent={devocionalSidebarContent}
        />
      </SidebarProvider>
    );
  }

  // Para todos os outros dias E para o download do livro, usar o layout original
  const selectedLessonAsLesson: Lesson | null = selectedLesson ? {
    id: selectedLesson.id,
    title: selectedLesson.title,
    type: selectedLesson.type,
    subtitle: selectedLesson.subtitle,
    description: selectedLesson.description,
    videoId: selectedLesson.videoId
  } : null;

  return (
    <SidebarProvider>
      <CourseLayout
        selectedLesson={selectedLessonAsLesson}
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
      />
    </SidebarProvider>
  );
}