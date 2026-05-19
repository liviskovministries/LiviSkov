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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock, PlayCircle, FileText, CheckCircle } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

// Define the course data structure
const courseData: CourseData = {
  title: 'Curso Os 5 Ofícios Ministeriais',
  modules: [
    {
      id: 'modulo-introducao',
      title: 'Introdução',
      lessons: [
        {
          id: 'intro-1',
          title: 'Bem-vindo ao Curso',
          type: 'video' as const,
          videoId: '0sW_n79aHsk',
          subtitle: 'Introdução ao curso',
          description: `Há alguns anos atrás, enquanto eu servia como Pastora Auxiliar no departamento internacional do BSSM, fui lavar o carro da minha pastora e o levei a um lava-jato automatizado, o que é bem comum nos Estados Unidos. Quando você posiciona o carro no lugar certo, eles não pedem para desligá-lo. Pelo contrário, pedem para mantê-lo ligado! Isso acontece por questões de segurança, afinal, todo carro manual possui o ponto morto, e no caso dos carros automáticos, a posição é "N" (de neutro). No lava-jato automatizado, é essencial que o carro esteja em ponto morto para ser levado até seu destino, pois, caso algo aconteça, você pode facilmente sair do lugar ao colocar a marcha certa.

Muitas vezes, ficamos tão familiarizados com os nossos ofícios que dificultamos o processo de entender nossa verdadeira identidade. Mas aqui vai uma dica, inspirada no funcionamento do lava-jato: sempre haverá um ofício que transbordará quando estivermos "no neutro".

Como assim? O que quero dizer é que, assim como eu e você, todos podemos profetizar, ensinar, evangelizar e até pastorear ou atuar no apostolado. São ações que valorizamos muito, tanto na igreja quanto na sociedade em geral. No entanto, sempre haverá uma delas que será o seu transbordar, aquele ofício que, sem nenhum esforço, se torna parte da sua identidade, temperamento, forma de amar e de trabalhar.

No meu caso, por exemplo, tenho o dom de profetizar. Já vivi grandes experiências em Deus quando ministrei no profético. Mas, quando estou em "ponto neutro", meu ofício principal é ser pastora! Gosto de cuidar de pessoas, e tenho uma graça sobrenatural para estar atenta e cercada de pessoas. Quando falo, é de forma que transbordo na vida das pessoas ao meu redor.

Neste momento, estou ensinando, o que é uma das ações presentes nos 5 ministérios. Mas a diferença está no PORQUÊ eu ensino. À medida que você ler os capítulos e assistir às aulas, entenderá de onde vem meu desejo de capacitar outras pessoas.

Existe uma grande diferença entre ter um ofício e exercê-lo. Como assim? Todos nós temos um ofício que exercemos de maneira natural, sem esforço, porque ele faz parte da nossa identidade. Por exemplo, há algumas semanas, soube que quatro moças estavam sem lugar para ficar por conta de um problema no hotel. Eu as acolhi em minha casa, preparei a mesa, organizei os quartos e cuidei delas, oferecendo tudo o que precisavam. Agir assim é algo que vem naturalmente, sem pensar duas vezes. Exercer os dons de profetizar, ensinar, pastorear, evangelizar e discipular (apostolado) é algo para todos nós!`,
        },
        {
          id: 'intro-2',
          title: 'O que são os Ofícios Ministeriais?',
          type: 'video' as const,
          videoId: '0sW_n79aHsk',
          subtitle: 'Entendendo o Conceito',
          description: `“E ele mesmo concedeu uns para apóstolos, outros para profetas, outros para evangelistas, outros para pastores e mestres, com vistas ao aperfeiçoamento dos santos para o desempenho do seu serviço, para a edificação do corpo de Cristo.”
Efésios 4:11-12

Pastor, Evangelista, Mestre, Apóstolo e Profeta.

Tudo o que você está lendo aqui é fruto da minha caminhada com Deus, de anos de estudo em dois seminários, com muito aprendizado e consagração. Mas, uma das lições mais importantes que aprendi é que a vida é feita de ciclos. Hoje, sei muito mais do que há 10 anos, e muitas certezas que eu tinha, hoje aprendi a ceder e permitir mudanças saudáveis.

Hoje, você pode se considerar um grande evangelista e, daqui a 10 anos, descobrir que se tornou um profeta de ofício. O amadurecimento nos permite enxergar que podemos e devemos mudar.

O que você está aprendendo aqui não é um horóscopo ou um teste de personalidade que te exime da responsabilidade de crescer como pessoa. Ao contrário, é um convite para se permitir ir além dos seus ofícios. Multiplique os talentos que Deus te deu e veja como Ele pode te honrar com muito mais do que você imagina. Leia Mateus 25:15-30 e medite na parábola dos talentos. Isso pode te ajudar a não temer as mudanças que podem surgir in sua vida.

E COMO EU DESCUBRO?

Criei um teste simples para te ajudar a encontrar as primeiras pistas sobre o ofício ao qual você pertence. Você pode se surpreender (ou não) com a resposta, mas lembre-se: ela é apenas uma bússola para te ajudar a se conectar com sua identidade. Normalmente, os dois primeiros ofícios são mais marcantes em sua vida, mas apenas um se manifesta quando você está em "ponto morto".

Aproveite estes dias de curso para refletir e escrever sobre como você se sente e vê o mundo ao seu redor.`,
        },
        {
          id: 'intro-3',
          title: 'Livro Os 5 Ofícios Ministeriais',
          type: 'resource' as const,
          subtitle: 'Sobre o Livro de Apoio',
          description: 'Acesse e baixe o material de apoio principal do curso. Este livro é a base da nossa jornada, aprofundando os temas abordados nas aulas e oferecendo exercícios práticos para cada ofício.',
        },
      ],
    },
    {
      id: 'modulo-pastor',
      title: 'Pastor',
      lessons: [
        {
          id: 'pastor-1',
          title: 'O Ofício de Pastor',
          type: 'video' as const,
          videoId: '5rt6pkMFD2E',
          subtitle: 'O Pastor: Guia e Cuidador',
          description: 'O pastor é aquele que cuida do rebanho de Deus. Eles são responsáveis por alimentar, guiar e proteger as ovelhas. Nesta lição, você entenderá o papel do pastor e como ele pastoreia a igreja.',
        },
      ],
    },
    {
      id: 'modulo-evangelista',
      title: 'Evangelista',
      lessons: [
        {
          id: 'evangelista-1',
          title: 'O Ofício de Evangelista',
          type: 'video' as const,
          videoId: 'w4fnk9onusU',
          subtitle: 'O Evangelista: Pregador do Evangelho',
          description: 'O evangelista é aquele que prega o evangelho e ganha almas para o reino de Deus. Eles são apaixonados por compartilhar a boa notícia e ver pessoas transformadas. Nesta lição, você aprenderá sobre o papel do evangelista e como ele impacta o mundo.',
        },
      ],
    },
    {
      id: 'modulo-apostolo',
      title: 'Apóstolo',
      lessons: [
        {
          id: 'apostolo-1',
          title: 'O Ofício de Apóstolo',
          type: 'video' as const,
          videoId: 'QEx5SiEROtg',
          subtitle: 'O Apóstolo: Fundador e Estabelecedor',
          description: 'O apóstolo é um dos ofícios mais importantes no corpo de Cristo. Eles são responsáveis por estabelecer novas igrejas, treinar líderes e garantir que a doutrina seja correta. Nesta lição, você aprenderá sobre o papel do apóstolo e como ele funciona no ministério.',
        },
      ],
    },
    {
      id: 'modulo-mestre',
      title: 'Mestre',
      lessons: [
        {
          id: 'mestre-1',
          title: 'O Ofício de Mestre',
          type: 'video' as const,
          videoId: 'DewkwZFGMXY',
          subtitle: 'O Mestre: Ensina e Instrui',
          description: 'O mestre é aquele que ensina a palavra de Deus de forma clara e compreensível. Eles são responsáveis por instruir, corrigir e edificar o corpo de Cristo. Nesta lição, você aprenderá sobre o papel do mestre e como ele contribui para o crescimento espiritual.',
        },
      ],
    },
    {
      id: 'modulo-profeta',
      title: 'Profeta',
      lessons: [
        {
          id: 'profeta-1',
          title: 'O Ofício de Profeta',
          type: 'video' as const,
          videoId: '1CZvtjsZ8_M',
          subtitle: 'O Profeta: Voz de Deus',
          description: 'O profeta é aquele que fala em nome de Deus. Eles trazem revelações, advertências e direção para a igreja. Nesta lição, você entenderá o papel do profeta e como ele se manifesta no ministério.',
        },
      ],
    },
    {
      id: 'modulo-conclusao',
      title: 'Encerramento',
      lessons: [
        {
          id: 'conclusao-1',
          title: 'Encerramento',
          type: 'video' as const,
          videoId: '9dpajnxfsGg',
          subtitle: 'Conclusão do Curso',
          description: 'Nesta última lição, faremos um resumo de tudo o que aprendemos e discutiremos como você pode aplicar esses princípios em sua vida e ministério. Que Deus te abençoe ricamente!',
        },
      ],
    },
  ],
};

// Generate all lessons for the course (for sidebar navigation)
const allLessons = courseData.modules.flatMap(module => module.lessons);

export default function OficiosMinisteriaisPage() {
  const { user: firebaseUser, isUserLoading: isFirebaseUserLoading } = useUser();
  const { user: supabaseUser, isUserLoading: isSupabaseUserLoading } = useSupabaseUser();
  const supabaseAuth = useSupabaseAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(courseData.modules[0].lessons[0]);
  const [completionStatus, setCompletionStatus] = useState<Record<string, boolean>>({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const courseId = 'oficios-ministeriais';

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
          .select('oficios_ministeriais_access')
          .eq('id', supabaseUser.id)
          .single();

        if (error) {
          console.error('Error checking Supabase user access:', error);
          setIsEnrolled(false);
        } else {
          setIsEnrolled(data?.oficios_ministeriais_access || false);
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
      [lessonId]: true,
    };

    setCompletionStatus(newStatus);

    setDocumentNonBlocking(progressDocRef, {
      id: courseId,
      completedLessons: newStatus,
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

      console.log("[OficiosMinisteriaisPage] Downloading watermarked PDF for:", { firstName, lastName, email });

      // Use the generic watermark-pdf function with dynamic parameters for this course
      const response = await fetch('https://rxvcxqfnkv/functions/v1/watermark-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          bucketName: 'Oficios Ministeriais', // Specific bucket name for this course
          filePath: 'Livi-Skov-Os-5-Oficios-Ministeriais.pdf', // Specific file path for this course
          outputFileName: `Livi-Skov-Os-5-Oficios-Ministeriais-${firstName}-${lastName}.pdf`,
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
      a.download = `Livi-Skov-Os-5-Oficios-Ministeriais-${firstName}-${lastName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download concluído!",
        description: "Seu material com marca d'água foi baixado com sucesso."
      });

    } catch (error: any) {
      console.error("[OficiosMinisteriaisPage] Error downloading watermarked PDF:", error);

      toast({
        variant: "destructive",
        title: "Erro no download",
        description: `Não foi possível baixar o material. Por favor, tente novamente mais tarde. Detalhes: ${error.message}`
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Sidebar content for the course (using Accordion for modules and lessons)
  const sidebarContent = useMemo(() => (
    <Accordion type="multiple" defaultValue={['modulo-introducao']} className="w-full">
      {courseData.modules.map((module) => {
        const releaseDate = module.releaseDate ? new Date(module.releaseDate) : null;
        const isModuleUnlocked = !releaseDate || currentTime >= releaseDate;

        return (
          <AccordionItem value={module.id} key={module.id} className="border-none">
            <AccordionTrigger className="px-4 py-2 text-sm font-semibold text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground hover:no-underline">
              {module.title}
            </AccordionTrigger>
            <AccordionContent className="pb-0 pl-3">
              <ul className="flex flex-col gap-1 py-2 border-l border-sidebar-border ml-3">
                {module.lessons.map((lesson) => {
                  const isLocked = !isModuleUnlocked;
                  const releaseDateFormatted = releaseDate ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(releaseDate) : '';

                  const lessonButton = (
                    <button
                      onClick={() => !isLocked && handleLessonClick(lesson)}
                      disabled={isLocked}
                      className={`w-full text-left text-sm p-2 rounded-md flex items-center gap-3 transition-colors ${
                        selectedLesson?.id === lesson.id
                          ? 'bg-sidebar-accent text-sidebar-foreground font-semibold'
                          : isLocked
                            ? 'cursor-not-allowed opacity-60'
                            : 'hover:bg-sidebar-accent'
                      }`}
                    >
                      {isLocked ? (
                        <Lock className="h-4 w-4 flex-shrink-0" />
                      ) : lesson.type === 'video' ? (
                        <PlayCircle className="h-4 w-4 flex-shrink-0"/>
                      ) : (
                        <FileText className="h-4 w-4 flex-shrink-0" />
                      )}
                      <span className="flex-1 truncate">{lesson.title}</span>
                      {completionStatus[lesson.id] && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </button>
                  );

                  return (
                    <li key={lesson.id} className="px-2">
                      <Tooltip> {/* Tooltip always rendered */}
                        <TooltipTrigger asChild>{lessonButton}</TooltipTrigger>
                        {isLocked && releaseDate && ( // TooltipContent conditionally rendered
                          <TooltipContent>
                            <p>Disponível em {releaseDateFormatted}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </li>
                  );
                })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  ), [courseData, completionStatus, handleLessonClick, currentTime, selectedLesson]);

  const handleLogout = async () => {
    const { error } = await supabaseAuth.signOut();
    if (error) {
      console.error("Erro ao fazer logout:", error.message);
    } else {
      router.push('/');
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

  // Render the course layout with the selected lesson content and sidebar
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
        handleDownloadResource={handleDownloadWatermarkedPdf}
        handleLogout={handleLogout}
        courseLogoPath="/images/logo-oficios-ministeriais.png"
        resourceCoverPath={PlaceHolderImages.find(img => img.id === 'oficios-ministeriais-cover')?.imageUrl || '/images/capa_devocional_2026.jpg'}
        sidebarContent={sidebarContent}
      />
    </SidebarProvider>
  );
}