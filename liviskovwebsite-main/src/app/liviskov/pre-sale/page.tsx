"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, RefreshCw, Copy } from "lucide-react"; // Importando o ícone Copy
import { SupabaseClient } from "@supabase/supabase-js";

const formSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  whatsapp: z.string().min(10, "Telefone inválido"),
});

type FormValues = z.infer<typeof formSchema>;

export default function PreSalePage() {
  const [step, setStep] = useState<"form" | "payment">("form");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Código PIX fornecido
  const pixCode = "00020126580014BR.GOV.BCB.PIX0136b31658e9-229f-4d7f-8ef5-863ad2c3316c520400005303986540520.005802BR592563.833.293 LIVI DOMITILA 6009SAO PAULO610805409000622505211BC0GLqKCSYhZ3t6nz1ue630407BE";

  useEffect(() => {
    if (!supabase) {
      console.error("Cliente do Supabase não foi criado. Verifique as variáveis de ambiente.");
      toast.error("Erro de configuração do Supabase. Verifique as variáveis de ambiente.");
    }
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormValues) => {
    if (!supabase) {
      toast.error("Supabase não configurado. Adicione as chaves de API.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await (supabase as SupabaseClient)
        .from("pre_sales")
        .insert([
          {
            name: data.name,
            email: data.email,
            whatsapp: data.whatsapp,
          }
        ]);
      
      if (error) {
        if (error.code === '23505') {
          toast.error("Este e-mail ou telefone já está cadastrado.");
        } else if (error.message) {
          toast.error(`Erro ao salvar dados: ${error.message}`);
        } else {
          toast.error("Erro desconhecido ao salvar dados.");
        }
        return;
      }
      
      toast.success("Dados salvos com sucesso!");
      setStep("payment");
    } catch (error: any) {
      if (error.message) {
        toast.error(`Erro: ${error.message}`);
      } else {
        toast.error("Erro desconhecido ao conectar com o banco de dados.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      toast.success("Código PIX copiado!");
    } catch (err) {
      toast.error("Falha ao copiar o código PIX.");
      console.error("Failed to copy PIX code: ", err);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      <Image 
        src="/outono-background.jpg" 
        alt="Background" 
        fill 
        className="object-cover z-0" 
        priority 
      />
      <div className="absolute inset-0 bg-black/70 z-10" />
      
      <div className="relative z-20 w-full max-w-md flex flex-col items-center">
        <Button 
          variant="ghost" 
          className="text-white mb-4 hover:bg-white/10 self-start"
          onClick={() => step === "payment" ? setStep("form") : router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>

        <div className="w-full flex justify-center mb-6">
          <Image
            src="/livi-skovi-logo.png"
            alt="Livi Skovi Logo"
            width={2400}
            height={1200}
            className="w-96 h-auto object-contain"
          />
        </div>
        
        <Card className="bg-white/95 backdrop-blur shadow-2xl border-none w-full">
          {step === "form" ? (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-tan-garland text-custom-green">Pré-Venda Exclusiva</CardTitle>
                <CardDescription>Garanta seu acesso antecipado por apenas R$ 20,00</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input 
                      id="name" 
                      placeholder="Seu nome" 
                      {...register("name")} 
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      {...register("email")} 
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp / Telefone</Label>
                    <Input 
                      id="whatsapp" 
                      placeholder="(00) 00000-0000" 
                      {...register("whatsapp")} 
                    />
                    {errors.whatsapp && <p className="text-xs text-red-500">{errors.whatsapp.message}</p>}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-custom-green hover:bg-custom-green/90 text-white py-6 text-lg rounded-xl mt-4"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="animate-spin h-4 w-4" />
                        Processando...
                      </span>
                    ) : "Ir para Pagamento"}
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-tan-garland text-custom-green">Quase lá!</CardTitle>
                <CardDescription>Realize o pagamento de R$ 20,00 via PIX para confirmar.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6">
                <div className="relative w-64 h-64 bg-gray-100 rounded-lg overflow-hidden border-4 border-white shadow-md">
                  <Image 
                    src="/pix-qr-code.png" 
                    alt="QR Code PIX" 
                    fill 
                    className="object-contain" 
                  />
                </div>

                <div className="w-full space-y-2">
                  <Label htmlFor="pix-code">Código PIX</Label>
                  <div className="flex w-full max-w-sm items-center space-x-2">
                    <Input 
                      id="pix-code" 
                      value={pixCode} 
                      readOnly 
                      className="flex-grow"
                    />
                    <Button 
                      type="button" 
                      onClick={handleCopyPixCode} 
                      variant="outline" 
                      size="icon"
                      className="bg-custom-green hover:bg-custom-green/90 text-white"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-custom-green hover:bg-custom-green/90 text-white rounded-xl py-6"
                  onClick={() => router.push("/liviskov")}
                >
                  Voltar ao Início
                </Button>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}