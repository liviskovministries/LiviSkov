'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking, useUser } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useSupabaseAuth, useSupabaseUser } from '@/integrations/supabase/supabase-provider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CourseLayout, Lesson, CourseData } from '@/components/course-layout'; // Importar CourseLayout e tipos

const devocionalCourseData: CourseData = {
  title: 'Devocional 2026',
  modules: [
    {
      id: 'devocional-intro',
      title: 'Introdução ao Devocional',
      lessons: [
        {
          id: 'devocional-welcome',
          title: 'Bem-vindo(a) ao Devocional 2026',
          type: 'video' as const,
          videoId: 'Dc4EBMJXQgg', // Placeholder video ID
          subtitle: 'Sua jornada de 31 dias começa aqui!',
          description: 'Bem-vindo(a) ao Devocional 2026! Prepare-se para 31 dias de encorajamento, renovo e recomeços na palavra de Deus. Este devocional foi criado para te guiar em uma jornada de fé e propósito para o novo ano.'
        },
        {
          id: 'devocional-pdf',
          title: 'Baixar Devocional em PDF',
          type: 'resource' as const,
          subtitle: 'Material de Apoio: Devocional 2026',
          description: 'Acesse e baixe o seu Devocional 2026 em formato PDF. Este material é essencial para acompanhar as leituras diárias e reflexões.'
        },
      ],
    },
    // Adicione mais módulos e aulas aqui conforme necessário para o Devocional 2026
  ],
};

export default function Devocional2026Page() {
  const { user: firebaseUser, isUserLoading: isFirebaseUserLoading } = useUser();
  const { user: supabaseUser, isUserLoading: isSupabaseUserLoading } = useSupabaseUser();
  const supabaseAuth = useSupabaseAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(devocionalCourseData.modules[0].lessons[0]);
  const [completionStatus, setCompletionStatus] = useState<Record<string, boolean>>({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  const courseId = 'devocional-2026'; // ID do curso para o Devocional

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
          .select('devocional_2026_access') // Verificar acesso específico para o Devocional 2026
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

      // Chamar a nova função Edge para o Devocional
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

  const handleLogout = async () => {
    const { error } = await supabaseAuth.signOut();
    if (error) {
      console.error("Erro ao fazer logout:", error.message);
    } else {
      router.push('/');
    }
  };

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
        courseLogoPath="/images/logo4branco.fw.png" // Usando o logo principal por enquanto
        resourceCoverPath="/images/devocional-2026-banner.jpg" // Capa do Devocional
      />
    </SidebarProvider>
  );
}