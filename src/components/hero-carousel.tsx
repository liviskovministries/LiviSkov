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
                <div className="container relative z-10 flex h-full flex-col items-center justify-start text-center px-4 pt-16"> {/* Alterado justify-center para justify-start e adicionado pt-16 */}
                  <h1 className="mt-4 text-2xl sm:text-3xl font-bold md:text-6xl"> {/* Adicionado mt-4 */}
                    {slide.title}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm sm:text-base md:text-xl px-2"> {/* Reduzido mt-3 para mt-2 */}
                    {slide.description}
                  </p>

                  {showLoginSignup ? (
                    <div className="mt-4 sm:mt-4 md:mt-6 flex flex-col sm:flex-row gap-2 md:gap-4"> {/* Reduzido mt-3 para mt-4 */}
                      <Button asChild size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-xs md:text-base h-10 md:h-12 w-full sm:w-auto">
                        <Link href="/login">Login</Link>
                      </Button>
                      <Button asChild variant="outline" size="lg" className="border-primary-foreground/50 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground text-xs md:text-base h-10 md:h-12 w-full sm:w-auto">
                        <Link href="/signup">Cadastre-se</Link>
                      </Button>
                    </div>
                  ) : slide.showEnrollmentMessage && hasEnrollmentEnded ? (
                    <div className="mt-4 sm:mt-4 md:mt-6 max-w-2xl text-sm md:text-lg text-white bg-red-600/80 p-3 md:p-4 rounded-lg shadow-lg"> {/* Reduzido mt-3 para mt-4 */}
                      <p className="font-bold flex items-center justify-center gap-2 text-xs md:text-base">
                        <Lock className="h-4 w-4 md:h-6 md:w-6" /> Inscrições Encerradas
                      </p>
                    </div>
                  ) : (
                    slide.buttonText && slide.buttonHref && (
                      <Link href={slide.buttonHref}>
                        <Button size="lg" className="mt-4 sm:mt-4 md:mt-6 bg-primary hover:bg-primary/90 text-primary-foreground text-xs md:text-base h-10 md:h-12"> {/* Reduzido mt-3 para mt-4 */}
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