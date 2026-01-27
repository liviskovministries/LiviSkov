'use client';

import { SiteHeader } from '@/components/header';
import { SiteFooter } from '@/components/footer';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Mail, MessageSquare } from 'lucide-react';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-background');
  const testimonialImage = PlaceHolderImages.find(img => img.id === 'testimonial-1');
  const contactImage = PlaceHolderImages.find(img => img.id === 'contact-background');

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.href;
    const targetId = href.replace(/.*\#/, "");
    const elem = document.getElementById(targetId);
    elem?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section id="inicio" className="relative h-[60vh] min-h-[400px] w-full text-black">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="container relative z-10 flex h-full flex-col items-center justify-center text-center">
            <h1 className="text-4xl font-bold md:text-6xl">
              Curso Estações Espirituais 2026
            </h1>
            <p className="mt-4 max-w-2xl text-lg md:text-xl">
              Aprenda a reconhecer e a viver plenamente cada estação da sua vida com Deus.
            </p>
            <Button asChild size="lg" className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/signup">Cadastre-se e adquira já</Link>
            </Button>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="bg-secondary py-20">
          <div className="container text-center">
             <h2 className="text-3xl font-bold text-primary">O que dizem sobre o curso Estações Espirituais</h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Veja o impacto da jornada das Estações Espirituais na vida de outras pessoas.
              </p>
              <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
                <Card className="flex flex-col items-center p-6 text-center">
                  <Avatar className="h-20 w-20">
                    {testimonialImage && <AvatarImage src={testimonialImage.imageUrl} alt="Testemunho de Bianca Lima" />}
                    <AvatarFallback>BL</AvatarFallback>
                  </Avatar>
                  <CardContent className="mt-4 p-0">
                    <p className="italic text-muted-foreground">"Compartilho sobre a experiência no Curso Estações com Livi Skov onde aprendi a importância de viver cada etapa da vida de forma leve e com a mente aberta para aprender algo novo na jornada da vida,seja renunciar algo que te trouxe até esse ponto X da sua vida atual,sendo esse processo de renuncia e entrega uma jornada de conhecimento na base da confiança no processo de Deus na sua vida e saber que tudo é movido por estações e tempo ."</p>
                    <p className="mt-4 font-semibold text-primary">- Bianca Lima</p>
                  </CardContent>
                </Card>
                 <Card className="flex flex-col items-center p-6 text-center">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/images/keteleen-rangel-testimonial.jpeg" alt="Testemunho de Keteleen Rangel" />
                    <AvatarFallback>KR</AvatarFallback>
                  </Avatar>
                  <CardContent className="mt-4 p-0">
                    <p className="italic text-muted-foreground">"Através do discipulado com a Livi, pude acessar ferramentas essenciais que foram fundamentais para alcançar um novo nível e uma nova estação em minha vida. Esse discipulado me conduziu a um lugar de cura, liberdade e transformação, destravando áreas da minha vida e me equipando para viver o propósito de Deus. As aulas da Livi são didáticas, profundas e repletas de chaves importantes que trazem consciência sobre as verdades do Reino de Deus. O discipulado é um espaço seguro para aprender, compartilhar a vida, ser vulnerável e crescer. A Livi transborda o amor de Deus, e todos que se sentam à mesa para aprender com ela desfrutam de uma mesa farta. Sou imensamente grata por esse discipulado e pelas sementes plantadas em minha vida através do transbordar da Livi. Caminhar ao lado dela é um privilégio. Posso afirmar que participar desse discipulado foi e tem sido essencial para o meu florescer. Sobre o curso 'Estações' ele é completo. Além das aulas, você terá acesso a um livro incrível que trará clareza, discernimento e propósito para as diferentes fases da sua vida. Compreender as estações e explorá-las à luz do Evangelho é indispensável para a jornada daqueles que escolheram se submeter ao processo de transformação. Quero te incentivar a se inscrever neste curso! Esse é um convite de Deus para você mergulhar nessa jornada incrível chamada 'Estações Espirituais'."</p>
                    <p className="mt-4 font-semibold text-primary">- Keteleen Rangel</p>
                  </CardContent>
                </Card>
              </div>
          </div>
        </section>

        {/* Sobre Section */}
        <section id="sobre" className="bg-background py-20">
          <div className="container grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-bold text-primary">Sobre Livi Skov</h2>
              <p className="mt-4 text-muted-foreground">
                A jornada de Livi Skov começou na adolescência, na Igreja Batista da Lagoinha, onde frequentou seu primeiro seminário (CTMDT) e serviu em ministérios como Diante do Trono e Joyce Meyer. Em 2018, concluiu o seminário da Bethel School of Supernatural Ministry (BSSM) na Califórnia e, no mesmo ano, foi consagrada pastora.
              </p>
              <p className="mt-4 text-muted-foreground">
                Desde então, sua jornada a levou a pregar em diversas igrejas pelo Brasil, Europa, EUA e Japão. Livi também serviu por 4 anos como Assistente Pastoral no departamento internacional da BSSM. Hoje, de volta ao Brasil, ela segue o chamado de Deus, ministrando de forma ousada e criativa sobre o Reino e ajudando pessoas a florescerem em sua dependência d'Ele.
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

        {/* Agenda Section */}
        <section id="agenda" className="bg-secondary py-20">
          <div className="container text-center">
            <h2 className="text-3xl font-bold text-primary">Agenda</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Confira os próximos eventos e workshops.
            </p>
            <div className="mt-12 grid grid-cols-1 gap-8 text-left md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Fevereiro</CardTitle>
                </CardHeader>
                <CardContent>
                  <p><strong>08/02</strong> - Pregação Igreja Blessings (São Paulo)</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Março</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>08/03</strong> - Igreja Blessing (São Paulo)</p>
                  <p><strong>15/03</strong> - Igreja Cabo Verde (São Paulo)</p>
                  <p><strong>19-21/03</strong> - Conferência de Mulheres</p>
                </CardContent>
              </Card>
            </div>
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
              Estamos aqui para ajudar. Envi e sua mensagem!
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
                <a
                  href="mailto:contato@liviskov.com"
                  className="mt-2 inline-block font-semibold text-primary hover:underline"
                >
                  contato@liviskov.com
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
                  Precisa de uma resposta rápida? Inicie uma conversa no chat ao
                  vivo clicando no ícone no canto da tela.
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