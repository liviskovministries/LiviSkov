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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useEffect } from 'react'; // Importar Suspense
import { useSupabaseAuth } from '@/integrations/supabase/supabase-provider';
import { SiteHeader } from '@/components/header';
import { SiteFooter } from '@/components/footer';

const formSchema = z.object({
  password: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' }),
  confirmPassword: z.string().min(6, { message: 'A confirmação de senha deve ter pelo menos 6 caracteres.' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

// Componente que contém a lógica do cliente e usa useSearchParams
function UpdatePasswordContent() {
  const { toast } = useToast();
  const supabaseAuth = useSupabaseAuth();
  const router = useRouter();
  const searchParams = useSearchParams(); // Este hook agora está dentro do componente cliente

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    // Supabase automaticamente lida com o token na URL para a função updateUser
    // Não precisamos extrair manualmente o access_token ou type aqui,
    // mas podemos verificar se estamos na rota correta para redefinição.
    // Se o usuário chegar aqui sem um token válido na URL (e o Supabase não o processar),
    // a chamada updateUser falhará ou o usuário será redirecionado pelo próprio Supabase.
  }, [searchParams]); // Adicionado searchParams como dependência para o useEffect, embora o uso direto não seja aqui.

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { data, error } = await supabaseAuth.updateUser({
        password: values.password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Senha redefinida com sucesso!",
        description: "Você pode fazer login com sua nova senha.",
      });
      router.push('/login?reset=true'); // Redireciona para login com um flag de sucesso
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao redefinir senha",
        description: error.message || "Não foi possível redefinir sua senha. Por favor, tente novamente.",
      });
      console.error(error);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-primary">Definir Nova Senha</CardTitle>
          <CardDescription className="text-center">Digite e confirme sua nova senha.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Sua nova senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Nova Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirme sua nova senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full transition-transform duration-200 hover:scale-105">Redefinir Senha</Button>
            </form>
          </Form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Voltar para o Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

export default function UpdatePasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <Suspense fallback={
        <main className="flex-1 flex items-center justify-center p-4">
          <p>Carregando formulário de atualização de senha...</p>
        </main>
      }>
        <UpdatePasswordContent />
      </Suspense>
      <SiteFooter />
    </div>
  );
}