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
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabaseAuth } from '@/integrations/supabase/supabase-provider'; // Usar hook Supabase
import { SiteHeader } from '@/components/header';
import { SiteFooter } from '@/components/footer';

const formSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
});

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const supabaseAuth = useSupabaseAuth(); // Usar o hook de autenticação Supabase
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Usar NEXT_PUBLIC_APP_URL se estiver definido, caso contrário, usar window.location.origin
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const redirectUrl = `${appUrl}/update-password`;

      const { error } = await supabaseAuth.resetPasswordForEmail(values.email, {
        redirectTo: redirectUrl, // Redirecionar para a nova página de atualização de senha
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Email de redefinição enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
      // Não redirecionar aqui, o usuário será redirecionado pelo link do email
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar email",
        description: error.message || "Não foi possível enviar o email de redefinição. Verifique o email informado.",
      });
      console.error(error);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-primary">Redefinir Senha</CardTitle>
            <CardDescription className="text-center">Digite seu email para receber o link de redefinição.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <Button type="submit" className="w-full transition-transform duration-200 hover:scale-105">Enviar Link</Button>
              </form>
            </Form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Lembrou sua senha?{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Faça login
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}