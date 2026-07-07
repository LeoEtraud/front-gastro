import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/use-auth';
import { useDeleteCourse, useTeacherCourses } from '@/hooks/use-teacher';
import { canCreateCourse, canDeleteCourse } from '@/lib/permissions';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Clock3, FileText, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreateCourseModal } from '@/components/course-management/create-entity-modals';
import { TeacherCoursesGridSkeleton } from '@/components/ui/content-skeletons';
import { useDelayedFlag } from '@/hooks/use-delayed-flag';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// PÁGINA DE LISTA DE CURSOS - PÁGINA PARA LISTAR OS CURSOS DO PROFESSOR
export default function CoursesList() {
  const { user } = useAuth();
  const { data: courses, isLoading } = useTeacherCourses();
  const showCreate = user ? canCreateCourse(user.role) : false;
  const showDelete = user ? canDeleteCourse(user.role) : false;
  const deleteCourse = useDeleteCourse();
  const showLoading = useDelayedFlag(isLoading);
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<{ id: string; title: string } | null>(null);
  const { toast } = useToast();
  const levelLabel: Record<string, string> = {
    BASIC: 'Básico',
    BEGINNER: 'Básico',
    INTERMEDIATE: 'Intermediário',
    ADVANCED: 'Avançado',
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    try {
      await deleteCourse.mutateAsync(courseToDelete.id);
      toast({
        variant: 'success',
        title: 'Curso excluído',
        description: `"${courseToDelete.title}" foi removido com sucesso.`,
      });
      setCourseToDelete(null);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Não foi possível excluir o curso',
        description: error?.response?.data?.error ?? 'Tente novamente.',
      });
    }
  };

  return (
    <AppLayout>
      <CreateCourseModal open={isCreateCourseOpen} onOpenChange={setIsCreateCourseOpen} />

      <AlertDialog
        open={!!courseToDelete}
        onOpenChange={(open) => {
          if (!open && !deleteCourse.isPending) setCourseToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir curso</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o curso{' '}
              <span className="font-semibold text-foreground">"{courseToDelete?.title}"</span>? Esta ação é permanente e
              removerá também todos os módulos, aulas e matrículas relacionadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteCourse.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(event) => {
                event.preventDefault();
                handleConfirmDelete();
              }}
              disabled={deleteCourse.isPending}
            >
              {deleteCourse.isPending ? 'Excluindo...' : 'Excluir curso'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mx-auto max-w-[92rem] min-w-0 space-y-6">
        <div className="flex items-start justify-between gap-3 sm:items-center">
          <div className="inline-flex w-fit flex-col gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Gerenciar Cursos</h1>
            <div className="h-1 w-full rounded-full bg-primary/80" />
          </div>
          {showCreate ? (
            <Button
              className="h-11 w-11 shrink-0 px-0 sm:h-auto sm:w-auto sm:px-4"
              onClick={() => setIsCreateCourseOpen(true)}
              aria-label="Novo Curso"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Novo Curso</span>
            </Button>
          ) : null}
        </div>

        {isLoading && showLoading ? (
          <TeacherCoursesGridSkeleton count={4} />
        ) : isLoading ? (
          <TeacherCoursesGridSkeleton count={2} />
        ) : courses?.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card py-20 text-center">
            <h3 className="mb-2 text-xl font-bold text-foreground">Você ainda não possui cursos</h3>
            <p className="mb-6 text-muted-foreground">Comece criando seu primeiro curso para seus alunos.</p>
            {showCreate ? (
              <Button onClick={() => setIsCreateCourseOpen(true)}>Criar Meu Primeiro Curso</Button>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses?.map(course => (
              <Card
                key={course.id}
                className="flex h-full flex-col overflow-hidden border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-video w-full bg-muted">
                  <div className="absolute inset-0 flex h-full w-full items-center justify-center text-muted-foreground">
                    <FileText className="h-8 w-8" />
                  </div>
                  {course.coverImageUrl ? (
                    <img
                      src={course.coverImageUrl}
                      className="absolute inset-0 h-full w-full object-cover"
                      alt={`Capa do curso ${course.title}`}
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                </div>
                <CardContent className="flex h-full flex-col gap-3 p-3 sm:gap-3.5 sm:p-4 xl:gap-3 xl:p-3 2xl:gap-3.5 2xl:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="line-clamp-1 text-[11px] font-semibold uppercase tracking-wide text-primary sm:text-xs">
                      {course.specialty || 'Especialidade não informada'}
                    </span>
                    <Badge variant={course.status === 'PUBLISHED' ? 'success' : 'secondary'}>
                      {course.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
                    </Badge>
                  </div>
                  <h3 className="line-clamp-2 text-base font-bold text-card-foreground sm:text-lg xl:text-base 2xl:text-lg">
                    {course.title}
                  </h3>
                  <p className="line-clamp-2 text-xs leading-snug text-muted-foreground sm:text-sm xl:text-xs 2xl:text-sm">
                    {course.shortDescription || course.subtitle || 'Sem descrição resumida.'}
                  </p>

                  <div className="flex items-center justify-between border-t border-border/80 pt-2.5 text-xs text-muted-foreground sm:pt-3 sm:text-sm">
                    <div className="flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {course.workloadHours ? `${course.workloadHours}h` : '--'}
                    </div>
                    <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                      {levelLabel[course.level] || course.level}
                    </div>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1 sm:gap-2">
                    <Link to={`/teacher/courses/${course.id}/edit`} className="flex-1 min-w-full sm:min-w-[8.5rem]">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full text-xs sm:text-sm"
                      >
                        <Edit2 className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" /> Editar
                      </Button>
                    </Link>
                    {showDelete ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 min-w-full text-xs sm:min-w-[8.5rem] sm:text-sm border-destructive/30 text-destructive hover:border-destructive hover:bg-destructive hover:text-destructive-foreground focus-visible:ring-destructive"
                        onClick={() => setCourseToDelete({ id: course.id, title: course.title })}
                        aria-label={`Excluir curso ${course.title}`}
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
                        Excluir curso
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
