"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LiviSkoviPage() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="min-h-screen bg-black" />;
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start p-4 overflow-hidden">
      <Image
        src="/outono-background.jpg"
        alt="Outono Background"
        fill
        priority
        className="object-cover z-0"
      />
      <div className="absolute inset-0 bg-custom-black opacity-60 z-10" />

      <main className="relative z-20 flex flex-col items-center justify-start h-full w-full max-w-md md:max-w-5xl mx-auto text-center space-y-6 md:space-y-16 pt-10">
        <div className="w-full flex justify-center">
          <Image
            src="/livi-skovi-logo.png"
            alt="Livi Skovi Logo"
            width={2400}
            height={1200}
            className="w-full md:w-[1200px] h-auto object-contain"
          />
        </div>

        {/* Sinopse e card com título, capa e botão */}
        <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6">
          {/* Card com título, capa e botão - à esquerda na versão desktop */}
          <div className="w-full md:w-1/2">
            <Card className="w-full h-full bg-white/90 backdrop-blur-sm shadow-xl border border-custom-green/50 text-custom-green p-6 flex flex-col items-center">
              <CardTitle className="text-3xl font-tan-garland mb-6 text-center">Um novo ano, um recomeço</CardTitle>
              <Image
                src="/livro.jpg"
                alt="Capa do Livro: Um novo ano, um recomeço"
                width={300} 
                height={450} 
                className="rounded-lg shadow-lg object-contain w-full h-auto max-w-[300px] mb-6"
              />
              <Button
                className="bg-custom-green hover:bg-custom-green/90 text-custom-white font-clear-sans text-lg px-8 py-6 rounded-full shadow-lg transition-all duration-300 ease-in-out"
                onClick={() => router.push('/livi-skovi/pre-sale')}
              >
                Adquira já!
              </Button>
              <CardHeader className="hidden">
                {/* Ocultando para manter estrutura do Shadcn */}
              </CardHeader>
              <CardContent className="hidden">
                {/* Ocultando para manter estrutura do Shadcn */}
              </CardContent>
            </Card>
          </div>
          
          {/* Sinopse - à direita na versão desktop, abaixo na versão mobile */}
          <div className="w-full md:w-1/2">
            <blockquote className="text-white text-lg md:text-xl font-serif italic text-center p-4 md:p-8 bg-[#224D3C] rounded-lg border-l-4 border-custom-green h-full">
              "Um novo ano, um recomeço" é um devocional de 31 dias que nasceu das profundezas do meu processo de fé, transições e recomeços. Eu te convido a uma jornada sincera para permanecer em Deus, mesmo quando tudo parece incerto. Descubra verdades sobre dores, esperas, identidade e esperança, e permita que estas páginas transformem sua caminhada com Deus.
              <br /><br />
              Acompanhe também uma jornada especial em janeiro! Todos os dias deste mês, estarei lançando um vídeo no meu Instagram <a href="https://www.instagram.com/liviskov" target="_blank" rel="noopener noreferrer" className="text-yellow-300 hover:underline">@liviskov</a>, ministrando cada dia do livro. 
              <br /><br />
              Não perca essa oportunidade de aprofundar sua fé!
            </blockquote>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}