import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useStudentEnrollments } from '@/hooks/use-student';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock3, PlayCircle, FileText } from 'lucide-react';
import { useDelayedFlag } from '@/hooks/use-delayed-flag';
import { StudentCoursesGridSkeleton } from '@/components/ui/content-skeletons';
import { normalizePtBrText } from '@/lib/normalize-ptbr';

const levelLabel: Record<string, string> = {
  BASIC: 'Básico',
  BEGINNER: 'Básico',
  INTERMEDIATE: 'Intermediário',
  ADVANCED: 'Avançado',
};

export default function StudentCourses() {
  const { data: enrollments, isLoading } = useStudentEnrollments();
  const showLoading = useDelayedFlag(isLoading);

  if (isLoading && showLoading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-[92rem] min-w-0 space-y-6">
          <div className="flex flex-col gap-2">
            <p className="mb-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">Estudante</p>
            <div className="inline-flex w-fit flex-col gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Meus Cursos</h1>
              <div className="h-1 w-full rounded-full bg-primary/80" />
            </div>
          </div>
          <StudentCoursesGridSkeleton count={4} />
        </div>
      </AppLayout>
    );
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-[92rem] min-w-0 space-y-6">
          <div className="flex flex-col gap-2">
            <p className="mb-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">Estudante</p>
            <div className="inline-flex w-fit flex-col gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Meus Cursos</h1>
              <div className="h-1 w-full rounded-full bg-primary/80" />
            </div>
          </div>
          <StudentCoursesGridSkeleton count={2} />
        </div>
      </AppLayout>
    );
  }
  if (!enrollments) return <AppLayout><div>Não foi possível carregar seus cursos.</div></AppLayout>;

  return (
    <AppLayout>
      <div className="mx-auto max-w-[92rem] min-w-0 space-y-6">
        <div className="flex flex-col gap-2">
          <p className="mb-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">Estudante</p>
          <div className="inline-flex w-fit flex-col gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Meus Cursos</h1>
            <div className="h-1 w-full rounded-full bg-primary/80" />
          </div>
        </div>

        {enrollments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center sm:py-20">
            <h3 className="mb-2 text-lg font-bold text-foreground sm:text-xl">Você ainda não está inscrito em nenhum curso</h3>
            <p className="mb-6 text-sm text-muted-foreground sm:text-base">Explore o catálogo e comece a aprender.</p>
            <Link to="/courses">
              <Button variant="outline">Explorar catálogo</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {enrollments.map((enrollment) => (
              <Card
                key={enrollment.id}
                className="flex h-full flex-col overflow-hidden border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative flex aspect-[4/3] w-full items-center justify-center bg-muted">
                  <div className="absolute inset-0 flex h-full w-full items-center justify-center text-muted-foreground">
                    <FileText className="h-8 w-8" />
                  </div>
                  {enrollment.course.coverImageUrl ? (
                    <img
                      src={enrollment.course.coverImageUrl}
                      alt={`Capa do curso ${enrollment.course.title}`}
                      className="relative z-[1] h-full w-full object-contain"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                </div>

                <CardContent className="flex h-full flex-col gap-2.5 p-3 sm:gap-3 sm:p-4">
                  <h3 className="line-clamp-2 text-base font-bold text-card-foreground sm:text-lg">
                    {normalizePtBrText(enrollment.course.title)}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-muted-foreground sm:text-sm">
                    <div className="flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {enrollment.course.workloadHours ? `${enrollment.course.workloadHours}h` : '--'}
                    </div>
                    <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                      {levelLabel[enrollment.course.level] ?? enrollment.course.level}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                      <span>Progresso</span>
                      <span>{Math.round(enrollment.progressPercent)}%</span>
                    </div>
                    <Progress value={enrollment.progressPercent} className="h-2" />
                  </div>

                  <div className="mt-auto pt-1">
                    <Link to={`/student/courses/${enrollment.courseId}/lessons/${enrollment.lastLessonId || 'start'}`} className="block">
                      <Button className="w-full text-xs sm:text-sm" size="sm">
                        <PlayCircle className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
                        {enrollment.lastLessonId ? 'Continuar curso' : 'Iniciar curso'}
                      </Button>
                    </Link>
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
