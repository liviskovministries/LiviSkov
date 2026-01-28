'use client';

import { useState, useEffect } from 'react';
import { useSupabaseUser } from '@/integrations/supabase/supabase-provider';
import { supabase } from '@/integrations/supabase/client';
import { SiteHeader } from '@/components/header';
import { SiteFooter } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

type UserCourse = {
  id: string;
  user_id: string;
  course_id: string;
  is_enrolled: boolean;
  enrolled_at: string | null;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
};

type UserProfile = {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

export default function AdminCoursesPage() {
  const { user, isUserLoading } = useSupabaseUser();
  const { toast } = useToast();
  const [usersCourses, setUsersCourses] = useState<UserCourse[]>([]);
  const [filteredUsersCourses, setFilteredUsersCourses] = useState<UserCourse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se o usuário é admin
  const isAdmin = user?.user_metadata?.first_name === 'Admin';

  useEffect(() => {
    if (!user || !isAdmin) return;

    const fetchUsersCourses = async () => {
      try {
        setIsLoading(true);
        
        // Buscar todos os registros de acesso aos cursos com dados do usuário
        const { data, error } = await supabase
          .from('user_courses')
          .select(`
            id,
            user_id,
            course_id,
            is_enrolled,
            enrolled_at,
            user:profiles(first_name, last_name, email)
          `)
          .order('user_id');
        
        if (error) throw error;
        
        // Transformar os dados para facilitar o uso
        const transformedData = data?.map(item => {
          // Verificar se item.user é um array ou objeto
          const userProfile = Array.isArray(item.user) ? item.user[0] : item.user;
          
          return {
            id: item.id,
            user_id: item.user_id,
            course_id: item.course_id,
            is_enrolled: item.is_enrolled,
            enrolled_at: item.enrolled_at,
            user_email: userProfile?.email || '',
            user_first_name: userProfile?.first_name || '',
            user_last_name: userProfile?.last_name || '',
          }
        }) || [];
        
        setUsersCourses(transformedData);
        setFilteredUsersCourses(transformedData);
      } catch (error) {
        console.error('Error fetching users courses:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Falha ao carregar os dados dos usuários."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsersCourses();
  }, [user, isAdmin, toast]);

  // Filtrar usuários com base no termo de busca
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsersCourses(usersCourses);
      return;
    }

    const filtered = usersCourses.filter(userCourse => 
      userCourse.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userCourse.user_first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userCourse.user_last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${userCourse.user_first_name} ${userCourse.user_last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredUsersCourses(filtered);
  }, [searchTerm, usersCourses]);

  const toggleEnrollment = async (userCourseId: string, userId: string, courseId: string, currentStatus: boolean) => {
    try {
      // Atualizar o status na tabela user_courses
      const { error } = await supabase
        .from('user_courses')
        .update({ 
          is_enrolled: !currentStatus,
          enrolled_at: !currentStatus ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userCourseId);
      
      if (error) throw error;
      
      // Se estiver concedendo acesso, também criar registro na tabela de inscrições
      if (!currentStatus) {
        const { error: enrollmentError } = await supabase
          .from('enrollments')
          .insert({
            user_id: userId,
            course_id: courseId,
            granted_by: 'Admin',
            notes: 'Acesso concedido manualmente pelo administrador'
          });
        
        if (enrollmentError) {
          // Reverter a atualização se falhar
          await supabase
            .from('user_courses')
            .update({ 
              is_enrolled: currentStatus,
              enrolled_at: currentStatus ? new Date().toISOString() : null,
              updated_at: new Date().toISOString()
            })
            .eq('id', userCourseId);
          
          throw enrollmentError;
        }
      } else {
        // Se estiver revogando acesso, remover da tabela de inscrições
        await supabase
          .from('enrollments')
          .delete()
          .eq('user_id', userId)
          .eq('course_id', courseId);
      }
      
      // Atualizar o estado local
      setUsersCourses(prev => prev.map(uc => 
        uc.id === userCourseId 
          ? { ...uc, is_enrolled: !currentStatus, enrolled_at: !currentStatus ? new Date().toISOString() : null } 
          : uc
      ));
      
      setFilteredUsersCourses(prev => prev.map(uc => 
        uc.id === userCourseId 
          ? { ...uc, is_enrolled: !currentStatus, enrolled_at: !currentStatus ? new Date().toISOString() : null } 
          : uc
      ));
      
      toast({
        title: "Sucesso",
        description: `Acesso ${!currentStatus ? 'concedido' : 'revogado'} com sucesso.`
      });
    } catch (error) {
      console.error('Error updating enrollment status:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Falha ao ${!currentStatus ? 'conceder' : 'revogar'} acesso.`
      });
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Você precisa estar logado para acessar esta página.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-primary py-12">
          <div className="container">
            <h1 className="text-3xl font-bold text-primary-foreground">Gerenciamento de Cursos</h1>
            <p className="mt-2 text-primary-foreground/80">
              Gerencie o acesso aos cursos para todos os usuários cadastrados
            </p>
          </div>
        </section>
        
        <div className="container py-8">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>Usuários e Acesso aos Cursos</CardTitle>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Buscar usuário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <p>Carregando dados...</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Curso</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data de Inscrição</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsersCourses.map((userCourse) => (
                        <TableRow key={userCourse.id}>
                          <TableCell>
                            <div className="font-medium">
                              {userCourse.user_first_name} {userCourse.user_last_name}
                            </div>
                          </TableCell>
                          <TableCell>
                            {userCourse.user_email}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {userCourse.course_id}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={userCourse.is_enrolled ? "default" : "secondary"}>
                              {userCourse.is_enrolled ? "Ativo" : "Bloqueado"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {userCourse.enrolled_at 
                              ? new Date(userCourse.enrolled_at).toLocaleDateString('pt-BR') 
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`enrollment-${userCourse.id}`}
                                checked={userCourse.is_enrolled}
                                onCheckedChange={() => toggleEnrollment(
                                  userCourse.id, 
                                  userCourse.user_id, 
                                  userCourse.course_id, 
                                  userCourse.is_enrolled
                                )}
                              />
                              <Label htmlFor={`enrollment-${userCourse.id}`}>
                                {userCourse.is_enrolled ? "Bloquear" : "Liberar"}
                              </Label>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              {!isLoading && filteredUsersCourses.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {searchTerm 
                      ? "Nenhum usuário encontrado com os critérios de busca." 
                      : "Nenhum usuário encontrado."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}