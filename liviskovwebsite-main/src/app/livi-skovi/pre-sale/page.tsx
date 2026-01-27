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
import { ArrowLeft, CheckCircle2, RefreshCw } from "lucide-react";
import { SupabaseClient } from "@supabase/supabase-js";

const formSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  whatsapp: z
    .string()
    .transform((val) => val.replace(/\D/g, '')) // Remove caracteres não numéricos primeiro
    .refine((val) => val.length >= 10, "Telefone inválido (mínimo 10 dígitos)"), // Valida o comprimento do valor limpo
});

type FormValues = z.infer<typeof formSchema>;

export default function PreSalePage() {
  const [step, setStep] = useState<"form" | "payment">("form");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // Link do checkout do Nubank
  const nubankCheckoutLink = "https://checkout.nubank.com.br/paSE598LHj6nz1ue";

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isValid },
    trigger,
    setValue,
    watch
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit", // Valida apenas na submissão
    defaultValues: {
      name: "",
      email: "",
      whatsapp: ""
    }
  });

  // Efeito para lidar com autofill
  useEffect(() => {
    const handleAutofill = () => {
      // Força a atualização dos valores do formulário quando o autofill ocorre
      setTimeout(() => {
        const nameInput = document.getElementById("name") as HTMLInputElement;
        const emailInput = document.getElementById("email") as HTMLInputElement;
        const whatsappInput = document.getElementById("whatsapp") as HTMLInputElement;
        
        if (nameInput && nameInput.value) setValue("name", nameInput.value);
        if (emailInput && emailInput.value) setValue("email", emailInput.value);
        if (whatsappInput && whatsappInput.value) setValue("whatsapp", whatsappInput.value);
      }, 100);
    };

    // Adiciona listeners para detectar autofill
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('animationstart', handleAutofill);
    });

    return () => {
      inputs.forEach(input => {
        input.removeEventListener('animationstart', handleAutofill);
      });
    };
  }, [setValue]);

  // Adicionando um useEffect para logar erros de validação, especialmente para o WhatsApp
  useEffect(() => {
    if (errors.whatsapp) {
      console.error("Erro de validação no WhatsApp:", errors.whatsapp.message);
    }
    if (errors.name) {
      console.error("Erro de validação no Nome:", errors.name.message);
    }
    if (errors.email) {
      console.error("Erro de validação no Email:", errors.email.message);
    }
  }, [errors]);

  const onSubmit = async (data: FormValues) => {
    console.log("onSubmit chamado com dados:", data);
    console.log("onSubmit: formState.isValid no momento da submissão:", isValid);
    
    if (!isValid) {
      console.error("Formulário inválido na submissão.");
      toast.error("Por favor, preencha todos os campos corretamente.");
      return;
    }

    if (!supabase) {
      toast.error("Supabase não configurado. Adicione as chaves de API.");
      console.error("Cliente Supabase não configurado.");
      return;
    }

    setIsLoading(true);
    try {
      // Log the data being sent to Supabase
      console.log("Dados a serem inseridos no Supabase:", {
        name: data.name,
        email: data.email,
        whatsapp: data.whatsapp,
      });
      console.log("Supabase client before insert:", supabase); // Log do cliente Supabase

      const { error } = await (supabase as SupabaseClient)
        .from("pre_sales")
        .insert([
          {
            name: data.name,
            email: data.email,
            whatsapp: data.whatsapp, // O valor já foi transformado e validado pelo Zod
          }
        ]);

      if (error) {
        console.error("Detalhes do erro Supabase (propriedades):", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        if (error.code === '23505') {
          toast.error("Este e-mail ou telefone já está cadastrado.");
        } else if (error.message) {
          toast.error(`Erro ao salvar dados: ${error.message}`);
        } else {
          toast.error("Erro desconhecido ao salvar dados no Supabase. Verifique o console para mais detalhes.");
        }
        return;
      }

      toast.success("Dados salvos com sucesso!");
      console.log("Dados salvos, mudando para a etapa de pagamento.");
      setStep("payment");
    } catch (error: any) {
      console.error("Erro no bloco catch:", error);
      if (error.message) {
        toast.error(`Erro: ${error.message}`);
      } else {
        toast.error("Erro desconhecido ao conectar com o banco de dados.");
      }
    } finally {
      setIsLoading(false);
      console.log("setIsLoading(false) chamado.");
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
              <CardHeader className="text-center flex-row items-center justify-center gap-4">
                <Image
                  src="/livro.jpg"
                  alt="Capa do Livro"
                  width={80}
                  height={120}
                  className="object-contain rounded-sm shadow-md"
                />
                <div>
                  <CardTitle className="text-2xl font-tan-garland text-custom-green">Livro: Um novo ano, um recomeço</CardTitle>
                  <CardDescription>Garanta seu livro agora por apenas R$ 30,00</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      placeholder="Seu nome"
                      {...register("name")}
                      autoComplete="name"
                      className="autofill-bg"
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
                      autoComplete="email"
                      className="autofill-bg"
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp / Telefone</Label>
                    <Input
                      id="whatsapp"
                      placeholder="(00) 00000-0000"
                      {...register("whatsapp")}
                      autoComplete="tel"
                      className="autofill-bg"
                    />
                    {errors.whatsapp && <p className="text-xs text-red-500">{errors.whatsapp.message}</p>}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-custom-green hover:bg-custom-green/90 text-white py-6 text-lg rounded-xl mt-4 relative z-30"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="animate-spin h-4 w-4" /> Processando...
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
                <CardDescription>Realize o pagamento de R$ 30,00 via Nubank para confirmar.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6">
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-6 text-lg"
                  onClick={() => window.open(nubankCheckoutLink, "_blank", "noopener noreferrer")}
                >
                  Pagar com Nubank
                </Button>
                <Button
                  className="w-full bg-custom-green hover:bg-custom-green/90 text-white rounded-xl py-6"
                  onClick={() => router.push("/livi-skovi")}
                >
                  Voltar ao Início
                </Button>
              </CardContent>
            </>
          )}
        </Card>
      </div>
      
      <style jsx global>{`
        .autofill-bg:-webkit-autofill,
        .autofill-bg:-webkit-autofill:hover,
        .autofill-bg:-webkit-autofill:focus,
        .autofill-bg:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px white inset !important;
          -webkit-text-fill-color: #000 !important;
        }
        .autofill-bg:focus:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px white inset !important;
          -webkit-text-fill-color: #000 !important;
        }
      `}</style>
    </div>
  );
}