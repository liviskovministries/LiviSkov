'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth, useSupabaseUser } from '@/integrations/supabase/supabase-provider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DevocionalLayout } from './DevocionalLayout'; // Importar o novo layout

type Lesson = {
  id: string;
  title: string;
  type: 'video' | 'resource';
  content?: string;
  videoId?: string;
  subtitle?: string;
  description: string;
};

const devocionalCourseData = {
  title: 'Devocional 2026 - Um novo ano, um recomeço',
  modules: [
    {
      id: 'devocional-intro',
      title: 'Introdução',
      lessons: [
        {
          id: 'devocional-intro-video',
          title: 'Boas-vindas ao Devocional 2026',
          type: 'video' as const,
          videoId: 'Dc4EBMJXQgg', // Placeholder
          subtitle: 'Sua jornada de 31 dias começa aqui!',
          description: 'Bem-vindo(a) ao Devocional 2026! Prepare-se para 31 dias de encorajamento, renovo e recomeços na Palavra de Deus. Este é um convite para mergulhar mais fundo na fé e encontrar inspiração para um novo ano.'
        },
        {
          id: 'devocional-book',
          title: 'Livro Devocional 2026',
          type: 'resource' as const,
          subtitle: 'Seu guia para 31 dias de reflexão',
          description: 'Baixe o seu livro devocional em PDF. Ele contém todas as leituras, reflexões e espaços para anotações para cada um dos 31 dias. Um recurso essencial para sua jornada!'
        },
      ],
    },
    {
      id: 'devocional-days',
      title: 'Dias do Devocional',
      lessons: Array.from({ length: 31 }, (_, i) => ({
        id: `day-${i + 1}`,
        title: `Dia ${i + 1}: Um Novo Começo`, // Placeholder title
        type: 'video' as const, // Assuming each day has a video
        videoId: 'Dc4EBMJXQgg', // Placeholder video ID
        subtitle: `Reflexão do Dia ${i + 1}`,
        description: `Neste dia, vamos refletir sobre a importância de um novo começo e como a graça de Deus nos capacita a recomeçar a cada manhã. Prepare seu coração para receber uma nova perspectiva.`,
      })),
    },
  ],
};

export default function DevocionalPage() {
  const { user: firebaseUser, isUserLoading: isFirebaseUserLoading } = useUser();
  const { user: supabaseUser, isUserLoading: isSupabaseUserLoading } = useSupabaseUser();
  const supabaseAuth = useSupabaseAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [completionStatus, setCompletionStatus] = useState<Record<string, boolean>>({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const courseId = 'devocional-2026';

  // Inicializa a lição selecionada para a primeira lição de introdução
  useEffect(() => {
    if (!selectedLesson && devocionalCourseData.modules.length > 0 && devocionalCourseData.modules[0].lessons.length > 0) {
      setSelectedLesson(devocionalCourseData.modules[0].lessons[0]);
    }
  }, [selectedLesson]);

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
    if (lesson.type !== 'resource') { // Marcar como completo se não for um recurso (ex: livro)
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
        description: "Você precisa estar logado para baixar o livro."
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
      // Fetch user profile from public.users table for reliable data
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

      console.log("[DevocionalPage] Downloading watermarked PDF for:", { firstName, lastName, email });

      const response = await fetch('https://rxvcxqfnkvqfxwzbujka.supabase.co/functions/v1/watermark-pdf-devocional', { // Novo endpoint para o devocional
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
      console.error("[DevocionalPage] Error downloading watermarked PDF:", error);
      toast({
        variant: "destructive",
        title: "Erro no download",
        description: `Não foi possível baixar o livro. Por favor, tente novamente mais tarde. Detalhes: ${error.message}`
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
    <DevocionalLayout
      selectedLesson={selectedLesson}
      courseData={devocionalCourseData}
      supabaseUser={supabaseUser}
      completionStatus={completionStatus}
      isDownloading={isDownloading}
      handleLessonClick={handleLessonClick}
      handleVideoEnd={handleVideoEnd}
      handleDownloadWatermarkedPdf={handleDownloadWatermarkedPdf}
      handleLogout={handleLogout}
    />
  );
}