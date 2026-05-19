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

Existe uma grande diferença entre ter um ofício e exercê-lo. Como assim? Todos nós temos um ofício que exercemos de maneira natural, sem espaço, porque ele faz parte da nossa identidade. Por exemplo, há algumas semanas, soube que quatro moças estavam sem lugar para ficar por conta de um problema no hotel. Eu as acolhi em minha casa, preparei a mesa, organizei os quartos e cuidei delas, oferecendo tudo o que precisavam. Agir assim é algo que vem naturalmente, sem pensar duas vezes. Exercer os dons de profetizar, ensinar, pastorear, evangelizar e discipular (apostolado) é algo para todos nós!`,
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

O que você está aprendendo aqui não é um horóscopo ou um teste de personalidade que te exime da responsabilidade de crescer como pessoa. Ao contrário, é um convite para se permitir ir além dos seus ofícios. Multiplique os talentos que Deus te deu e veja como Ele pode te honrar com muito mais do que você imagina. Leia Mateus 25:15-30 e medite na parábola dos talentos. Isso pode te ajudar a não temer as mudanças que podem surgir em sua vida.

E COMO EU DESCUBRO?

Criei um teste simples para te ajudar a encontrar as primeiras pistas sobre o ofício ao qual você pertence. Você pode se surpreender (ou não) com a resposta, mas lembre-se: ela é apenas uma bússola para te ajudar a se conectar com sua identidade. Normalmente, os dois primeiros ofícios são mais marcantes em sua vida, mas apenas um se manifesta quando você está em "ponto morto".

Aproveite estes dias de curso para refletir e escrever sobre como você se sente e vê o mundo ao seu redor.`,
        },
        {
          id: 'intro-3',
          title: 'Apostila Os 5 Ofícios Ministeriais',
          type: 'resource' as const,
          videoId: 'nWRteCjnTuI',
          subtitle: 'Sobre a Apostila de Apoio',
          description: 'Acesse e baixe o material de apoio principal do curso. Esta apostila é a base da nossa jornada, aprofundando os temas abordados nas aulas e oferecendo exercícios práticos para cada ofício.',
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
          videoId: 'vW5mFOnZpA4',
          subtitle: 'O Pastor',
          description: `O ofício de Pastor é algo que eu posso falar de trás para frente. É o que tenho na minha vida e a minha forma mais genuína de transbordar, seja no ministério ou na vida pessoal.

O Pastor é aquele que ama o cuidado. Seja ao receber pessoas, protegê-las ou incentivá-las. Ele pensa muito mais nos outros do que em si mesmo.

No ofício de Pastor, você será amado por aqueles que admiram sua capacidade de ver o mundo com compaixão e amor.

O Pastor é o mais facilmente reconhecido pelos seus talentos e atributos. Muitas vezes, ele é visto como um bom amigo, conselheiro e alguém em quem se pode confiar. É um ofício que geralmente se torna uma referência positiva para as pessoas ao redor.

No entanto, o Pastor muitas vezes comete o erro de não saber dizer não e criar limites saudáveis. Uma das maiores dificuldades desse ofício é lidar com a solidão. Uma das lições mais valiosas que aprendi, como alguém que tem o Pastor como ofício, é aprender a valorizar quando alguém verdadeiramente pergunta: "Como você está?"

Não estou sendo piegas ou me vitimizando. O Pastor costuma colocar tudo e todos à frente de si, e por isso, não há muito espaço para se concentrar em suas próprias emoções. Essa é uma das razões pelas quais é difícil aprender a dizer não e reconhecer a solidão que vem de assumir tantas responsabilidades.`,
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
          videoId: '5K4_bXZW_PM',
          subtitle: 'O Evangelista',
          description: `O Ofício do Evangelista, assim como o mestre, é muitas vezes julgado incorretamente pelas pessoas. Erroneamente, achamos que ele é o que fala mais alto, sendo que, na verdade, o destaque faz parte da sua natureza. É o mais arrojado de todos os ofícios e, por isso, frequentemente não é compreendido pela sociedade que o cerca.

Por enxergar fora da caixa, acaba sendo visto como alguém “chato”, porque acredita tanto na sua causa que tenta provar seu ponto de vista para todos ao seu redor. O evangelista enfrenta muitas lutas internas por ser desmerecido por pessoas que não entendem o valor do seu trabalho, sentindo-se desmotivado pela falta de honra daqueles que não enxergam seu esforço.

Para o evangelista, o esforço é a prova do seu caráter. O esforço está acima do talento. Se você disser a um evangelista que ele não consegue fazer algo, ou que é inadequado para determinada atividade, é exatamente aí que ele vai querer provar que consegue. Ainda que não haja custo-benefício, o importante para ele é demonstrar que estava certo desde o início.

Muitas pessoas nesse ofício têm facilidade para fazer planos, mas encontram dificuldade para sonhar. Isso porque “sonhar” depende de pessoas, depende de Deus e de acreditar em algo que não se faz sozinho. São pessoas de natureza visionária, mas não necessariamente sonhadoras.`,
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
          videoId: 'oaCRnb7yh4E',
          subtitle: 'O Apóstolo',
          description: `O ofício do Apóstolo está profundamente ligado à capacidade de gerir, liderar e coordenar não apenas o trabalho e as pessoas ao seu redor, mas também suas próprias emoções. Diferente do Pastor, que lidera com alimento, amor e cuidado, o Apóstolo lidera com visão e ação intensa.

O Apóstolo é, por natureza, revolucionário. Ele nunca se contenta com o comum e acredita que as coisas podem, e devem, mudar. Sonhador, ele muitas vezes se perde em seus sonhos, esquecendo-se de que, para alcançar o sonho, é necessário investir na realidade. Ele não tem medo de mudar, de se reinventar, e é, talvez, o que mais sabe lidar com derrotas e dificuldades. Mas, por ser um sonhador, ele precisa de um propósito claro para viver — seja o trabalho, a família, o ministério ou até mesmo seus hobbies. Uma vez com o foco alinhado, se não conseguir mudar a cidade, ele mudará de cidade!

Ele tem uma visão além do alcance, mas não se ocupa com microgestão. Ele vê o futuro, constrói o necessário e segue para o próximo desafio. Delegar é uma habilidade que ele domina, assim como a capacidade de cobrar o que é preciso.

Apóstolos são raros. Muitas vezes, a pessoa pode ter o ofício apostólico, mas é necessário passar por uma jornada de aprendizado para viver a excelência desse ofício. Isso porque, frequentemente, alguém com o ofício apostólico precisa aprender a fluir em outros ofícios antes de poder operar plenamente no seu próprio, e para aceitar-se por completo como é.

Jesus é o Apóstolo supremo, e Ele é a referência que temos do verdadeiro apostolado (Efésios 3:1).`,
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
          videoId: 'kTNZrqY6k14',
          subtitle: 'O Mestre',
          description: `O ofício de Mestre é, entre todos, o que mais costuma ser mal interpretado.

Ser professor, ensinar e capacitar são apenas ramos de uma árvore imensa.

O Mestre busca a VERDADE em sua essência. Ele não aceita nada menos do que a verdade pura e genuína. Dedica sua vida ao crescimento contínuo e ao esforço incansável para fazer o que é certo.

Ele é preto no branco, não se permitindo os 500 milhões de tons de cinza. Isso faz dele alguém em quem se pode confiar, mas também alguém com grande dificuldade para mudar.

Todas as profissões exatas estão profundamente conectadas ao dom do Mestre, porque a verdade precisa ser absoluta. Se na engenharia o cálculo estiver errado, a ponte cai. Apesar de muitas vezes não valorizarmos a beleza daqueles que amam as exatas, precisamos deles para que as coisas aconteçam de maneira linear e contínua. E é nesse lugar que o Mestre revela sua beleza criativa.

Ele é criativo, mas essa criatividade é direcionada para o bem comum. Ama a arte e se torna o curador de um museum, o paleontólogo que estuda dinossauros ou o museólogo que transforma a experiência das pessoas ao visitarem o museu. Ele usa seu talento logístico e, quando somado à sua criatividade, transborda para além das ciências exatas.

Se o evangelista pode ser visto em um policial, o Mestre pode ser representado por um advogado ou até mesmo um juiz, pois um executa a lei que o outro decreta. São ofícios complementares — um fortalecendo o outro, para alcançar a excelência de todos.`,
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
          videoId: 'GQWbfofxO_g',
          subtitle: 'O Profeta',
          description: `O Profeta é o artista. Aquele que enxerga a beleza do Criador de uma forma única. Ele é como Maria, que permanece aos pés de Jesus, preferindo a beleza da Sua presença aos aplausos do mundo.

O ofício mais criativo, ao lado, pasmem, do Mestre!

Enquanto o Mestre cria para o bem comum, com o objetivo de proporcionar uma vida excelente para todos, o Profeta transborda. Ele se expressa através de seus sentimentos, de sua adoração, de suas lutas. Sua criação vem da vulnerabilidade extrema, porque ele é, e sempre será, intenso. Extremamente completo.

Se você tiver um museu, o Mestre será o museólogo ou o curador da obra que o Profeta vai expor.

Como Maria, que quebrou o vaso de alabastro aos pés de Jesus, ou João Batista, que não temia falar a verdade, o Profeta é o extremo na simplicidade.

Ele é o 0 e o 1000. Ele é tudo ou nada. Ele entrega o que tem de mais profundo, sem reservas.

E essa entrega é tanto seu maior triunfo quanto sua maior dificuldade.

O Profeta é o meu segundo ofício mais forte. Aquele que eu sou e ajo naturalmente, especialmente quando somado ao Pastoral. A combinação desses dois ofícios faz com que eu seja extremamente cuidadosa, mas também livre, amando a vida sem limites e a beleza do improviso.`,
        },
      ],
    },
    {
      id: 'modulo-conclusao',
      title: 'Encerramento',
      lessons: [
        {
          id: 'conclusao-1',
          title: 'Live de Encerramento',
          type: 'video' as const,
          videoId: 'XuMjQLyPNjc',
          subtitle: 'GRANDE ENCONTRO FINAL – Aulão ao Vivo no Zoom',
          description: `Este foi o nosso último encontro, um momento de conexão e reflexão sobre tudo o que vivemos.

💡 O que tivemos?

✅ Compartilhamento de experiências.
✅ Reflexões sobre cada Ofício.
✅ Direcionamentos para o futuro.
✅ Um tempo de comunhão e gratidão.

🚀 Prepare-se para assistir a um GRANDE encerramento numa reunião maravilhosa no Zoom! 🎓🎊`,
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
      const response = await fetch('https://rxvcxqfnkvqfxwzbujka.supabase.co/functions/v1/watermark-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          bucketName: 'Os 5 Oficios Ministeriais', // Specific bucket name for this course
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
        resourceCoverPath={PlaceHolderImages.find(img => img.id === 'oficios-ministeriais-cover')?.imageUrl || '/images/capa-5-oficios.jpg'}
        sidebarContent={sidebarContent}
      />
    </SidebarProvider>
  );
}