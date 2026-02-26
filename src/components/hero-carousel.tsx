'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import useEmblaCarousel from 'embla-carousel-react';
import { useSupabaseUser } from '@/integrations/supabase/supabase-provider'; // Importar useSupabaseUser

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
  showAuthButtons?: boolean; // Nova propriedade para mostrar botões de Login/Cadastro
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  interval?: number;
}

export function HeroCarousel({ slides, interval = 7000 }: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const { user, isUserLoading } = useSupabaseUser(); // Obter status do usuário

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
    <section id="inicio" className="relative h-[60vh] min-h-[400px] w-full text-white overflow-hidden">
      <div className="embla h-full w-full" ref={emblaRef}>
        <div className="embla__container flex h-full">
          {slides.map((slide) => {
            const hasEnrollmentEnded = slide.enrollmentDeadline ? new Date() > slide.enrollmentDeadline : false;
            const showLoginSignup = slide.showAuthButtons && !isUserLoading && !user;

            return (
              <div className="embla__slide relative flex-[0_0_100%] h-full" key={slide.id}>
                <Image
                  src={slide.imageUrl}
                  alt={slide.imageHint}
                  fill
                  className={cn(
                    "object-cover",
                    slide.id === 'welcome-banner' && "lg:object-center-top-10"
                  )}
                  priority
                  data-ai-hint={slide.imageHint}
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="container relative z-10 flex h-full flex-col items-center justify-center text-center">
                  <h1 className="text-4xl font-bold md:text-6xl">
                    {slide.title}
                  </h1>
                  <p className="mt-4 max-w-2xl text-lg md:text-xl">
                    {slide.description}
                  </p>

                  {showLoginSignup ? (
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                      <Button asChild size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                        <Link href="/login">Login</Link>
                      </Button>
                      <Button asChild variant="outline" size="lg" className="border-primary-foreground/50 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                        <Link href="/signup">Cadastre-se</Link>
                      </Button>
                    </div>
                  ) : slide.showEnrollmentMessage && hasEnrollmentEnded ? (
                    <div className="mt-8 max-w-2xl text-lg text-white bg-red-600/80 p-4 rounded-lg shadow-lg">
                      <p className="font-bold flex items-center justify-center gap-2">
                        <Lock className="h-6 w-6" /> Inscrições Encerradas
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