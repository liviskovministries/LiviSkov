'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import useEmblaCarousel from 'embla-carousel-react';
import { useSupabaseUser } from '@/integrations/supabase/supabase-provider';

interface HeroSlide {
  id: string;
  imageUrl: string;
  imageHint: string;
  title: string;
  description: string;
  buttonText?: string;
  buttonHref?: string;
  showEnrollmentMessage?: boolean;
  enrollmentDeadline?: Date;
  showAuthButtons?: boolean;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  interval?: number;
}

export function HeroCarousel({ slides, interval = 7000 }: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const { user, isUserLoading } = useSupabaseUser();

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentSlideIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setCurrentSlideIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, interval);
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      clearInterval(autoplay);
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, interval, onSelect]);

  const goToSlide = useCallback((index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
    }
  }, [emblaApi]);

  return (
    <section id="inicio" className="relative h-[45vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] xl:h-[85vh] min-h-[350px] w-full text-white overflow-hidden">
      <div className="embla h-full w-full" ref={emblaRef}>
        <div className="embla__container flex h-full">
          {slides.map((slide) => {
            const hasEnrollmentEnded = slide.enrollmentDeadline ? new Date() > slide.enrollmentDeadline : false;
            const showLoginSignup = slide.showAuthButtons && !isUserLoading && !user;
            const isMentoria = slide.id === 'mentoria-banner';

            return (
              <div className="embla__slide relative flex-[0_0_100%] h-full" key={slide.id}>
                <Image
                  src={slide.imageUrl}
                  alt={slide.imageHint}
                  fill
                  className={cn(
                    "object-cover",
                    slide.id === 'welcome-banner' && "lg:object-center-top-10",
                    isMentoria && "grayscale"
                  )}
                  priority
                  data-ai-hint={slide.imageHint}
                />
                {/* Overlay escuro apenas para os outros banners, mantendo o de mentoria mais natural */}
                {!isMentoria && <div className="absolute inset-0 bg-black/50" />}

                {isMentoria ? (
                  <>
                    {/* Aviso vermelho no topo - Inscrições Encerradas */}
                    <div className="absolute top-0 left-0 right-0 z-20 bg-red-600 py-2 px-4">
                      <p className="text-white font-bold text-center text-sm sm:text-base md:text-lg tracking-wider">
                        INSCRIÇÕES ENCERRADAS
                      </p>
                    </div>
                    <div className="absolute bottom-[13%] sm:bottom-[13%] md:bottom-[11%] lg:bottom-[10%] xl:bottom-[11%] left-1/2 -translate-x-1/2 z-10 w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl flex justify-center px-4">
                      {/* Textos ocultos apenas para leitores de tela (SEO/Acessibilidade) */}
                      <h1 className="sr-only">{slide.title}</h1>
                      <p className="sr-only">{slide.description}</p>
                      {slide.buttonText && slide.buttonHref && (
                        <span 
                          className="font-mono text-stone-800 text-sm sm:text-base md:text-xl lg:text-2xl xl:text-3xl font-bold tracking-wider px-4 py-1 sm:px-6 sm:py-2 rounded bg-transparent cursor-not-allowed text-center whitespace-nowrap opacity-50"
                          style={{ fontFamily: 'Courier New, Courier, monospace, serif' }}
                        >
                          {slide.buttonText}
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="container relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
                      <h1 className="text-3xl font-bold md:text-6xl">
                        {slide.title}
                      </h1>
                      <p className="mt-4 max-w-2xl text-base md:text-xl px-2">
                        {slide.description}
                      </p>
                      {showLoginSignup ? (
                        <div className="mt-6 md:mt-8 flex flex-row gap-3 md:gap-4">
                          <Button asChild size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-sm md:text-base">
                            <Link href="/login">Login</Link>
                          </Button>
                          <Button asChild variant="outline" size="lg" className="border-primary-foreground/50 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground text-sm md:text-base">
                            <Link href="/signup">Cadastre-se">Cadastre-se</Link>
                          </Button>
                        </div>
                      ) : slide.showEnrollmentMessage && hasEnrollmentEnded ? (
                        <div className="mt-6 md:mt-8 max-w-2xl text-base md:text-lg text-white bg-red-600/80 p-4 rounded-lg shadow-lg">
                          <p className="font-bold flex items-center justify-center gap-2">
                            <Lock className="h-5 w-5 md:h-6 md:w-6" /> Inscrições Encerradas
                          </p>
                        </div>
                      ) : (
                        slide.buttonText && slide.buttonHref && (
                          <Link href={slide.buttonHref}>
                            <Button size="lg" className="mt-6 md:mt-8 bg-primary hover:bg-primary/90 text-primary-foreground text-sm md:text-base">
                              {slide.buttonText}
                            </Button>
                          </Link>
                        )
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

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