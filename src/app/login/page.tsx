'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation'; // Importar useSearchParams
import Link from 'next/link';
import { useEffect } from 'react';
import { SiteHeader } from '@/components/header';
import { SiteFooter } from '@/components/footer';
import Image from 'next/image';
import { useSupabaseAuth, useSupabaseUser } from '@/integrations/supabase/supabase-provider'; // Usar hooks Supabase

const formSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
});

export default function LoginPage() {
  const { toast } = useToast();
  const supabaseAuth = useSupabaseAuth(); // Usar o hook de autenticação Supabase
  const router = useRouter();
  const searchParams = useSearchParams(); // Inicializar useSearchParams
  const { user, isUserLoading } = useSupabaseUser(); // Usar o hook de usuário Supabase

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (user) {
      router.push('/courses');
    }
  }, [user, router]);

  // Efeito para exibir toast de sucesso após redefinição de senha
  useEffect(() => {
    const resetSuccess = searchParams.get('reset');
    if (resetSuccess === 'true') {
      toast({
        title: "Senha redefinida!",
        description: "Sua senha foi redefinida com sucesso. Faça login com sua nova senha.",
      });
      // Limpar o parâmetro da URL para que a mensagem não apareça novamente
      router.replace('/login', { scroll: false });
    }
  }, [searchParams, toast, router]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { error } = await supabaseAuth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Você será redirecionado em breve.",
      });
      router.push('/courses');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: error.message || "Email ou senha incorretos.",
      });
      console.error(error);
    }
  }

  if (isUserLoading || user) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <p>Carregando...</p>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="flex flex-col items-center">
            <Image
              src="/images/logoverde2.fw.png"
              alt="Livi Skov Logo"
              width={150}
              height={50}
              className="mb-6 h-auto"
            />
            <CardTitle className="text-center text-2xl text-primary">Acessar Plataforma</CardTitle>
            <CardDescription className="text-center">Bem-vindo(a) de volta!</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                       <div className="flex items-center justify-between">
                        <FormLabel>Senha</FormLabel>
                        <Link href="/forgot-password"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Esqueceu sua senha?
                        </Link>
                      </div>
                      <FormControl>
                        <Input type="password" placeholder="Sua senha" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full transition-transform duration-200 hover:scale-105">Entrar</Button>
              </form>
            </Form>
            
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Não tem uma conta?{' '}
              <Link href="/signup" className="font-semibold text-primary hover:underline">
                Cadastre-se
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}