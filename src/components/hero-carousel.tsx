'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [slides.length, interval]);

  const currentSlide = slides[currentSlideIndex];

  // Lógica para o status de inscrição, específica para o slide "Estações Espirituais"
  const hasEnrollmentEnded = currentSlide.enrollmentDeadline ? new Date() > currentSlide.enrollmentDeadline : false;

  return (
    <section id="inicio" className="relative h-[60vh] min-h-[400px] w-full text-white overflow-hidden">
      {currentSlide && (
        <Image
          src={currentSlide.imageUrl}
          alt={currentSlide.imageHint}
          fill
          className="object-cover transition-opacity duration-1000 ease-in-out"
          priority
          data-ai-hint={currentSlide.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-black/50" /> {/* Overlay escuro para legibilidade do texto */}
      <div className="container relative z-10 flex h-full flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold md:text-6xl">
          {currentSlide.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg md:text-xl">
          {currentSlide.description}
        </p>

        {currentSlide.showEnrollmentMessage && hasEnrollmentEnded ? (
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
          currentSlide.buttonText && currentSlide.buttonHref && (
            <Link href={currentSlide.buttonHref}>
              <Button size="lg" className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground">
                {currentSlide.buttonText}
              </Button>
            </Link>
          )
        )}
      </div>
    </section>
  );
}