'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { 
  SidebarProvider, 
} from '@/components/ui/sidebar';
import { useSupabaseAuth, useSupabaseUser } from '@/integrations/supabase/supabase-provider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CourseLayout } from './CourseLayout'; // Importar o novo componente CourseLayout

type Lesson = {
  id: string;
  title: string;
  type: 'video' | 'resource';
  subtitle?: string;
  description: string;
  videoId?: string;
};

const courseData = {
  title: 'Curso Estações Espirituais',
  modules: [
    {
      id: 'modulo-0',
      title: 'Introdução',
      lessons: [
        {
          id: 'intro-1',
          title: 'Boas-vindas',
          type: 'video' as const,
          videoId: 'Dc4EBMJXQgg',
          subtitle: 'Boas-vindas ao Curso!',
          description: 'Bem-vinda ao curso Estações Espirituais! 🌿\n\nNeste módulo introdutório, você entenderá como as diferentes fases da vida refletem as estações do ano e como Deus trabalha em cada uma delas.'
        },
        {
          id: 'intro-2',
          title: 'O que são as Estações Espirituais?',
          type: 'video' as const,
          videoId: 'Dc4EBMJXQgg',
          subtitle: 'Entendendo o Conceito',
          description: 'Este curso é uma jornada espiritual através das estações da minha vida.'
        },
        {
          id: 'intro-3',
          title: 'Livro Estações Espirituais',
          type: 'resource' as const,
          subtitle: 'Sobre o Livro de Apoio',
          description: 'Acesse e baixe o material de apoio principal do curso.'
        },
      ],
    },
    {
      id: 'modulo-1',
      title: '🍂 Outono',
      releaseDate: '2026-02-04',
      lessons: [
        {
          id: 'outono-1',
          title: 'Aula 1: Outono',
          type: 'video' as const,
          videoId: 'QEx5SiEROtg',
          subtitle: '🍂 Outono – O Tempo de Soltar e Confiar',
          description: 'O outono é um tempo de transição e desapego.'
        },
      ],
    },
    {
      id: 'modulo-2',
      title: '❄️ Inverno',
      releaseDate: '2026-02-09',
      lessons: [
        {
          id: 'inverno-1',
          title: 'Aula 2: Inverno',
          type: 'video' as const,
          videoId: '1CZvtjsZ8_M',
          subtitle: '❄️ Inverno – Fortalecendo Raízes na Espera',
          description: 'O inverno espiritual é um tempo de espera, paciência e profundidade.'
        },
      ],
    },
    {
      id: 'modulo-3',
      title: '🌱 Primavera',
      releaseDate: '2026-02-11',
      lessons: [
        {
          id: 'prim-1',
          title: 'Aula 3: Primavera',
          type: 'video' as const,
          videoId: 'w4fnk9onusU',
          subtitle: '🌸 Primavera – O Florescer de uma Nova Temporada',
          description: 'A primavera espiritual é tempo de novidade e transformação!'
        },
      ],
    },
    {
      id: 'modulo-5',
      title: '🔄 Transição',
      releaseDate: '2026-02-16',
      lessons: [
        {
          id: 'trans-1',
          title: 'Aula 4: Transição',
          type: 'video' as const,
          videoId: '5rt6pkMFD2E',
          subtitle: '🔄 Transição – Abraçando Mudanças e Novos Começos',
          description: 'A transição pode ser desafiadora, pois o antigo já não serve mais.'
        },
      ],
    },
    {
      id: 'modulo-4',
      title: '☀️ Verão',
      releaseDate: '2026-02-18',
      lessons: [
        {
          id: 'verao-1',
          title: 'Aula 5: Verão',
          type: 'video' as const,
          videoId: 'DewkwZFGMXY',
          subtitle: '☀️ Verão – A Colheita e o Impacto do Propósito',
          description: 'O verão espiritual é tempo de colheita e abundância!'
        },
      ],
    },
    {
      id: 'modulo-6',
      title: '🎉 Encerramento',
      releaseDate: '2026-02-23',
      lessons: [
        {
          id: 'enc-1',
          title: 'Live de Encerramento',
          type: 'video' as const,
          videoId: 'hfQRwqcqsxU',
          subtitle: 'GRANDE ENCONTRO FINAL',
          description: 'Este foi o nosso último encontro, um momento de conexão.'
        },
      ],
    },
  ],
};

const PDF_URL_SIGNED = 'https://rxvcxqfnkvqfxwzbujka.supabase.co/storage/v1/object/sign/Estacoes%20Espirituais/Livi-Skov-Estacoes-Espirituais.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80ODZlMTgxYy1kOWI4LTRkNTctYjY1ZS1iZWFkNzUxM2Q0ZTIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJFc3RhY29lcyBFc3Bpcml0dWFpcy9MaXZpLVNrb3YtRXNwaXJpdHVhaXMucGRmIiwiaWF0IjoxNzcwMzE0MjMzLCJleHAiOjE4MDE4NTAyMzN9.d9IhE8PGnmCRe3iaxuyVzAJLbjGaJzryXhCbN3wLLoY';

export default function CoursePage() {
  const { user: firebaseUser } = useUser();
  const { user: supabaseUser } = useSupabaseUser();
  const supabaseAuth = useSupabaseAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(courseData.modules[0].lessons[0]);
  const [completionStatus, setCompletionStatus] = useState<Record<string, boolean>>({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentTime] = useState<Date>(new Date());
  
  const courseId = 'estacoes-espirituais';

  const progressDocRef = useMemoFirebase(() => {
    if (!firebaseUser || !firestore) return null;
    return doc(firestore, 'users', firebaseUser.uid, 'courseProgress', courseId);
  }, [firebaseUser, firestore]);

  const { data: progressData } = useDoc<{ completedLessons: Record<string, boolean> }>(progressDocRef);

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
        const { data } = await supabase
          .from('users')
          .select('estacoes_espirituais_access')
          .eq('id', supabaseUser.id)
          .single();
        
        setIsEnrolled(data?.estacoes_espirituais_access || false);
      } catch {
        setIsEnrolled(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkEnrollmentStatus();
  }, [supabaseUser]);

  useEffect(() => {
    if (!supabaseUser && !isLoading) {
      router.push('/login');
    }
    
    if (supabaseUser && !isLoading && !isEnrolled) {
      router.push('/courses');
    }
  }, [supabaseUser, router, isEnrolled, isLoading]);

  const markLessonAsComplete = (lessonId: string) => {
    if (!progressDocRef || completionStatus[lessonId]) return;
    
    const newStatus = { ...completionStatus, [lessonId]: true };
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
      const firstName = supabaseUser.user_metadata?.first_name || '';
      const lastName = supabaseUser.user_metadata?.last_name || '';
      const email = supabaseUser.email || '';

      const response = await fetch('https://rxvcxqfnkvqfxwzbujka.supabase.co/functions/v1/watermark-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfUrl: PDF_URL_SIGNED, firstName, lastName, email }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const pdfBlob = await response.blob();
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Livi-Skov-Estacoes-Espirituais-${firstName}-${lastName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download concluído!",
        description: "Seu livro com marca d'água foi baixado com sucesso."
      });

    } catch {
      try {
        const directResponse = await fetch(PDF_URL_SIGNED);
        if (directResponse.ok) {
          const pdfBlob = await directResponse.blob();
          const url = window.URL.createObjectURL(pdfBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'Livi-Skov-Estacoes-Espirituais.pdf';
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          
          toast({
            title: "Download do PDF original concluído",
            description: "O livro foi baixado sem marca d'água."
          });
          return;
        }
      } catch {}

      toast({
        variant: "destructive",
        title: "Erro no download",
        description: "Não foi possível baixar o livro."
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleLogout = async () => {
    await supabaseAuth.signOut();
    router.push('/');
  };

  if (!supabaseUser || isLoading) {
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
        courseData={courseData}
        supabaseUser={supabaseUser}
        completionStatus={completionStatus}
        isDownloading={isDownloading}
        currentTime={currentTime}
        handleLessonClick={handleLessonClick}
        handleVideoEnd={handleVideoEnd}
        handleDownloadWatermarkedPdf={handleDownloadWatermarkedPdf}
        handleLogout={handleLogout}
      />
    </SidebarProvider>
  );
}