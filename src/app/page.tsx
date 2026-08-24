'use client';

import { SiteHeader } from '@/components/header';
import { SiteFooter } from '@/components/footer';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Mail, MessageSquare } from 'lucide-react';

import { HeroCarousel } from '@/components/hero-carousel';

// Definir os eventos da agenda com datas
const agendaEvents = [
  {
    id: 'setembro-06',
    month: 'Setembro',
    date: '06/09',
    description: 'Igreja Batista Blessing, São Paulo/SP',
    fullDate: new Date('2024-09-06'),
  },
  {
    id: 'setembro-11-12',
    month: 'Setembro',
    date: '11-12/09',
    description: 'Conferência florescer na Igreja Batista Nacional em Brasnorte/MT',
    fullDate: new Date('2024-09-11'),
  },
  {
    id: 'outubro-11',
    month: 'Outubro',
    date: '11/10',
    description: 'Igreja Batista Blessing',
    fullDate: new Date('2024-10-11'),
  },
  {
    id: 'outubro-25',
    month: 'Outubro',
    date: '25/10',
    description: 'Igreja Cabo Verde São Paulo/SP',
    fullDate: new Date('2024-10-25'),
  },
  {
    id: 'novembro-06-08',
    month: 'Novembro',
    date: '06-08/11',
    description: 'Conferência Sinfônica - Curitiba/PR',
    fullDate: new Date('2024-11-06'),
  },
  {
    id: 'dezembro-13',
    month: 'Dezembro',
    date: '13/12',
    description: 'Igreja Batista Blessing',
    fullDate: new Date('2024-12-13'),
  },
];

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-background');
  const testimonialImage = PlaceHolderImages.find(img => img.id === 'testimonial-1');
  const contactImage = PlaceHolderImages.find(img => img.id === 'contact-background');
  const devocionalBannerImage = PlaceHolderImages.find(img => img.id === 'devocional-2026-hero-banner');

  // Definir a data limite para as inscrições (ex: 19 de Julho de 2024)
  const enrollmentDeadline = new Date('2024-07-19T23:59:59'); // Exemplo: 19 de Julho de 2024, 23:59:59

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.href;
    const targetId = href.replace(/.*\#/, "");
    const elem = document.getElementById(targetId);
    elem?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  const heroSlides = [
    {
      id: 'mentoria-banner',
      imageUrl: '/images/livi-banner.png',
      imageHint: 'Mentoria com Livi Skov',
      title: 'Mentoria com Livi Skov - Inscrições Abertas',
      description: 'Formulário de inscrição para a mentoria com Livi Skov. Início em 01 de julho.',
      buttonText: 'CLIQUE AQUI PARA SE INSCREVER',
      buttonHref: 'https://docs.google.com/forms/d/e/1FAIpQLSdd6fx7MURdLjA5MsceAXP4MkWVxHD2LZzNZ9LOFLLkxcWl8w/viewform',
    },
    {
      id: 'welcome-banner',
      imageUrl: '/images/livi-skov-welcome-banner.png',
      imageHint: 'Livi Skov welcome banner',
      title: 'Bem-vindo(a) ao meu website!',
      description: 'Descubra uma jornada de fé, propósito e transformação.',
      buttonText: 'Saiba Mais',
      buttonHref: '/#sobre',
    },
    {
      id: 'devocional-2026-banner',
      imageUrl: devocionalBannerImage?.imageUrl || '/images/mulher-pensativa-noite-urbana.png',
      imageHint: devocionalBannerImage?.imageHint || 'thoughtful woman urban night',
      title: 'Devocional 2026 - Um novo ano, um recomeço',
      description: 'Adquise já o e-book e tenha acesso aos 31 vídeos que acompanham você nessa jornada. Tudo por apenas R$35,00. Cadastre-se e adquira já!',
      showAuthButtons: true, // Mostrar botões de login/cadastramento
    },
  ];

  // Filtrar eventos que ainda não passaram
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Zera as horas para comparar apenas as datas
  
  const upcomingEvents = agendaEvents.filter(event => event.fullDate >= today);
  
  // Agrupar eventos por mês
  const eventsByMonth = upcomingEvents.reduce((acc, event) => {
    if (!acc[event.month]) {
      acc[event.month] = [];
    }
    acc[event.month].push(event);
    return acc;
  }, {} as Record<string, typeof agendaEvents>);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section - Agora usando HeroCarousel */}
        <HeroCarousel slides={heroSlides} />

        {/* Sobre Section */}
        <section id="sobre" className="bg-background py-20">
          <div className="container grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-bold text-primary">Sobre Livi Skov</h2>
              <p className="mt-4 text-muted-foreground">
                A jornada de Livi Skov começou na adolescência, na Igreja Batista da Lagoinha, onde frequentou seu primeiro seminário (CTMDT) e serviu em ministérios como Diante do Trono e Joyce Meyer. Em 2018, concluiu o seminário da Bethel School of Supernatural Ministry (BSSM) na Califórnia e, no mesmo ano, foi consagrada pastora.
              </p>
              <p className="mt-4 text-muted-foreground">
                Desde então, sua jornada a levou a pregar en diversas igrejas pelo Brasil, Europa, EUA e Japão. Livi também serviu por 4 anos como Assistente Pastoral no departamento internacional da BSSM. Hoje, de volta ao Brasil, ela segue o chamado de Deus, ministrando de forma ousada e criativa sobre o Reino e ajudando pessoas a florescerem na dependência d'Ele.
              </p>
            </div>
            <div className="order-1 md:order-2">
              <Image
                src="/images/livi-skov-profile.png"
                alt="Livi Skov"
                width={600}
                height={600}
                className="rounded-lg shadow-lg"
                data-ai-hint="Livi Skov portrait"
              />
            </div>
          </div>
        </section>

        {/* Agenda Section - With automatic date filtering */}
        <section id="agenda" className="bg-secondary py-20">
          <div className="container text-center">
            <h2 className="text-3xl font-bold text-primary">Agenda</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Confira os próximos eventos e workshops.
            </p>
            {upcomingEvents.length > 0 ? (
              <div className="mt-12 grid grid-cols-1 gap-8 text-left md:grid-cols-2">
                {Object.entries(eventsByMonth).map(([month, events]) => (
                  <Card key={month}>
                    <CardHeader>
                      <CardTitle className="text-primary">{month}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {events.map(event => (
                        <p key={event.id}><strong>{event.date}</strong> - {event.description}</p>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="mt-12 text-center">
                <p className="text-lg text-muted-foreground">
                  Nenhum evento programado no momento. Volte em breve!
                </p>
              </div>
            )}
            <div className="mt-12 text-center">
              <p className="text-lg text-muted-foreground">
                Caso deseje saber mais sobre os eventos ou mesmo marcar uma agenda com a Livi, entre em contato conosco.
              </p>
            </div>
          </div>
        </section>

        {/* Fale Conosco Section */}
        <section id="fale-conosco" className="relative h-[40vh] min-h-[300px] w-full bg-secondary">
          {contactImage && (
            <Image
              src={contactImage.imageUrl}
              alt={contactImage.description}
              fill
              className="object-cover"
              priority
              data-ai-hint={contactImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-black/50" />
          <div className="container relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
            <h2 className="text-4xl font-bold md:text-5xl">Fale Conosco</h2>
            <p className="mt-4 max-w-2xl text-lg">
              Estamos aqui para ajudar. Envie sua mensagem!
            </p>
          </div>
        </section>

        <section className="bg-background py-20">
          <div className="container mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Mail className="h-6 w-6" />
                  <span>Email</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground">
                  Para dúvidas, sugestões ou suporte, envie um email para:
                </p>
                <a href="mailto:liviskovministries@gmail.com" className="mt-2 inline-block font-semibold text-primary hover:underline">
                  liviskovministries@gmail.com
                </a>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <MessageSquare className="h-6 w-6" />
                  <span>Chat ao Vivo</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground">
                  Precisa de uma resposta rápida? Inicie uma conversa no chat ao vivo clicando no ícone no canto da tela.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}