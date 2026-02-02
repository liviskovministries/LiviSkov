'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import useEmblaCarousel from 'embla-carousel-react'; // Importar Embla

interface HeroSlide {
  id: string;
  imageUrl: string;
  imageHint: string;
  title: string;
  description: string;
  buttonText?: string;
  buttonHref?: string;
  showEnrollmentMessage?: boolean; // Para o slide "Estações Espirituais"
  enrollmentDeadline?: Date; // Para o slide "Estações Espirituais"
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  interval?: number; // Tempo em ms para a troca automática de slides
}

export function HeroCarousel({ slides, interval = 7000 }: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }); // Inicializar Embla com loop
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Atualizar currentSlideIndex quando o slide selecionado do Embla muda
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentSlideIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setCurrentSlideIndex]);

  // Lógica de auto-play
  useEffect(() => {
    if (!emblaApi) return;

    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, interval);

    emblaApi.on('select', onSelect); // Ouvir mudanças de slide
    emblaApi.on('reInit', onSelect); // Re-inicializar em reInit

    return () => {
      clearInterval(autoplay);
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, interval, onSelect]);

  // Função para ir para um slide específico (para os pontos de navegação)
  const goToSlide = useCallback((index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
    }
  }, [emblaApi]);

  return (
    <section id="inicio" className="relative h-[60vh] min-h-[400px] w-full text-white overflow-hidden">
      {/* Estrutura do Embla Carousel */}
      <div className="embla h-full w-full" ref={emblaRef}>
        <div className="embla__container flex h-full">
          {slides.map((slide) => {
            // Lógica para o status de inscrição, específica para o slide "Estações Espirituais"
            const hasEnrollmentEnded = slide.enrollmentDeadline ? new Date() > slide.enrollmentDeadline : false;

            return (
              <div className="embla__slide relative flex-[0_0_100%] h-full" key={slide.id}>
                <Image
                  src={slide.imageUrl}
                  alt={slide.imageHint}
                  fill
                  className="object-cover"
                  priority
                  data-ai-hint={slide.imageHint}
                />
                <div className="absolute inset-0 bg-black/50" /> {/* Overlay escuro para legibilidade do texto */}
                <div className="container relative z-10 flex h-full flex-col items-center justify-center text-center">
                  <h1 className="text-4xl font-bold md:text-6xl">
                    {slide.title}
                  </h1>
                  <p className="mt-4 max-w-2xl text-lg md:text-xl">
                    {slide.description}
                  </p>

                  {slide.showEnrollmentMessage && hasEnrollmentEnded ? (
                    <div className="mt-8 max-w-2xl text-lg text-white bg-red-600/80 p-4 rounded-lg shadow-lg">
                      <p className="font-bold flex items-center justify-center gap-2">
                        <Lock className="h-6 w-6" /> Inscrições Encerradas
                      </p>
                      <p className="mt-2 text-sm">
                        Se você se inscreveu a tempo, por favor,{' '}
                        <Link href="/signup" className="font-semibold underline hover:text-white/80">
                          cadastre-se no site
                        </Link>{' '}
                        e entre em contato conosco para ter acesso liberado ao seu login.
                      </p>
                    </div>
                  ) : (
                    slide.buttonText && slide.buttonHref && (
                      <Link href={slide.buttonHref}>
                        <Button size="lg" className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground">
                          {slide.buttonText}
                        </Button>
                      </Link>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              index === currentSlideIndex ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/75"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}