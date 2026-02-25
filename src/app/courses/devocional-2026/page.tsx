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

// Função para gerar as 31 aulas diárias
const generateDailyLessons = (): UnifiedLesson[] => {
  const lessons: UnifiedLesson[] = [];
  
  // Dias específicos com título personalizado
  const daysConfig = [
    { day: '01', title: 'Dia 01 - Um (Re)novo em Deus', videoId: 'v2TBVoIbHrw', description: 'Primeiro dia do devocional! Começamos nossa jornada de renovação e crescimento espiritual.' },
    { day: '02', title: 'Dia 02 | Aprendendo a ouvir a voz de Deus', videoId: 'bYWG7Z3jtkM', description: 'Aprendendo a discernir e ouvir a voz de Deus em meio ao ruído do mundo.' },
    { day: '03', title: 'Dia 03 | Quando Deus fala no silêncio', videoId: 'FnHu9bFUf9A', description: 'Descobrindo como Deus se revela nos momentos de quietude e silêncio interior.' },
    { day: '04', title: 'Dia 04 — ENTREGANDO O CONTROLE', videoId: 'O7rc-Wsn394', description: 'Aprendendo a confiar em Deus e entregar o controle das nossas vidas nas mãos dele.' },
    { day: '05', title: 'Dia 05 — CURANDO AS FERIDAS DO CORAÇÃO', videoId: 'K-gmfSH39Lg', description: 'Trazendo cura e restauração para as áreas feridas do nosso coração através do amor de Deus.' },
    { day: '06', title: 'Dia 06 — A força da vulnerabilidade', videoId: 'EOmSm-JLDlA', description: 'Descobrindo a força que existe em nos mostrarmos vulneráveis diante de Deus e dos outros.' },
    { day: '07', title: 'DIA 7 | Quem somos em Deus', videoId: 'JNk8vNtMDMA', description: 'Explorando nossa verdadeira identidade em Deus e compreendendo quem somos Nele.' },
    { day: '08', title: 'Dia 8 | Filhos do Rei | Noiva de Cristo | Amigos do Espírito Santo', videoId: 'PzMtVOuVIJI', description: 'Descobrindo nossa identidade divina como filhos do Rei, noiva de Cristo e amigos do Espírito Santo.' },
    { day: '09', title: 'DIA 9 — Deus nos processos', videoId: 'yZogeLVkDys', description: 'Entendendo como Deus está presente e atuando em todos os processos da nossa vida.' },
    { day: '10', title: 'DIA 10 — Quando Deus parece em silêncio', videoId: 'AEE7zZHEydc', description: 'Aprendendo a confiar em Deus mesmo quando Ele parece estar em silêncio em nossas vidas.' },
    { day: '11', title: 'Dia 11 — Descansar também é fé', videoId: '2iiLpr89Nno', description: 'Aprendendo que descansar também é um ato de fé e confiança em Deus.' },
    { day: '12', title: 'Dia 12 — Quando Deus nos chama pra confiar', videoId: 'rjL3g723O48', description: 'Reconhecendo os momentos em que Deus nos chama para confiar completamente Nele, mesmo quando não entendemos o caminho.' },
    { day: '13', title: 'Dia 13 — Obediência que abre caminhos', videoId: 'Vzoq_AFznP0', description: 'Descobrindo como a obediência a Deus pode abrir portas e criar novos caminhos em nossa jornada espiritual.' },
    { day: '14', title: 'Dia 14 — Coração Ensinável 🤍', videoId: 'lycl6Q4MaRw', description: 'Cultivando um coração aberto e receptivo para aprender com Deus em todas as situações da vida.' },
    { day: '15', title: 'Dia 15 — Posicionamento gera direção', videoId: 'y5ozHEzySAU', description: 'Entendendo como nosso posicionamento espiritual determina a direção que Deus nos guia em nossa jornada.' },
    { day: '16', title: 'Dia 16 – Permanecer quando é mais fácil fugir', videoId: 'FVg2aW3NKo4', description: 'Aprendendo a permanecer firmes diante dos desafios quando a tentação de fugir parece mais forte.' },
    { day: '17', title: 'Dia 17 — Quando Deus não explica, mas sustenta', videoId: 'R2fdG9iTs_E', description: 'Aprendendo a confiar que mesmo quando Deus não explica as razões, Ele sempre nos sustenta em cada passo.' },
  ];

  // Dias de 18 a 31 com título padrão
  for (let i = 18; i <= 31; i++) {
    const day = String(i).padStart(2, '0');
    daysConfig.push({ 
      day: day, 
      title: `Devocional - Dia ${day}`, 
      videoId: 'Dc4EBMJXQgg', 
      description: `Bem-vindo ao devocional do Dia ${day}!` 
    });
  }

  // Criar as lições baseadas na configuração
  daysConfig.forEach(config => {
    lessons.push({
      id: `day-${config.day}`,
      title: config.title,
      subtitle: `Dia ${config.day}`,
      type: 'video' as const,
      videoId: config.videoId,
      description: config.description,
      bookText: '' // Texto vazio para remover o conteúdo do livro
    });
  });

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
          description: `Este devocional de 31 dias foi cuidadosamente preparado para guiar sua jogada espiritual.\n\nBaixe o livro completo para acompanhar os devocionais diários.`
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
  const [selectedLesson, setSelectedLesson] = useState<UnifiedLesson | null>(devocionalCourseData.modules[0].lessons[1] as UnifiedLesson); // Começar com Dia 01
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

  // Identificar se é um dos dias que usa o layout especial
  const isSpecialDay = selectedLesson?.id === 'day-01' || selectedLesson?.id === 'day-02' || 
                       selectedLesson?.id === 'day-03' || selectedLesson?.id === 'day-04' ||
                       selectedLesson?.id === 'day-05' || selectedLesson?.id === 'day-06' ||
                       selectedLesson?.id === 'day-07' || selectedLesson?.id === 'day-08' ||
                       selectedLesson?.id === 'day-09' || selectedLesson?.id === 'day-10' ||
                       selectedLesson?.id === 'day-11' || selectedLesson?.id === 'day-12' ||
                       selectedLesson?.id === 'day-13' || selectedLesson?.id === 'day-14' ||
                       selectedLesson?.id === 'day-15' || selectedLesson?.id === 'day-16' ||
                       selectedLesson?.id === 'day-17';

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

  // Usar o layout específico para os dias especiais (01-17)
  if (isSpecialDay) {
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