import { AppLayout } from '@/components/layout/AppLayout';
import { useTeacherDashboard } from '@/hooks/use-teacher';
import { Card, CardContent } from '@/components/ui/card';
import { Users, FileVideo, Target } from 'lucide-react';
import { DashboardSkeleton, TeacherDashboardStatsSkeleton } from '@/components/ui/content-skeletons';
import { useDelayedFlag } from '@/hooks/use-delayed-flag';

function formatPercent(value: number): string {
  const n = Number.isFinite(value) ? value : 0;
  return `${n.toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 0 })}%`;
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'PUBLISHED':
      return 'PUBLICADO';
    case 'DRAFT':
      return 'RASCUNHO';
    case 'ARCHIVED':
      return 'ARQUIVADO';
    default:
      return status.toUpperCase();
  }
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'PUBLISHED':
      return 'bg-emerald-700 text-white ring-1 ring-emerald-800/60';
    case 'DRAFT':
      return 'bg-amber-600 text-white ring-1 ring-amber-700/60';
    case 'ARCHIVED':
      return 'bg-slate-600 text-white ring-1 ring-slate-700/60';
    default:
      return 'bg-muted text-foreground ring-1 ring-border';
  }
}

export default function TeacherDashboard() {
  const { data, isLoading } = useTeacherDashboard();
  const showLoading = useDelayedFlag(isLoading);
  const isWaitingData = isLoading && !data;

  if (isWaitingData && showLoading) return <AppLayout><DashboardSkeleton /></AppLayout>;
  if (isWaitingData) {
    return (
      <AppLayout>
        <TeacherDashboardStatsSkeleton />
      </AppLayout>
    );
  }
  if (!data) return <AppLayout><div>Erro</div></AppLayout>;

  return (
    <AppLayout>
      <div className="mx-auto max-w-[92rem] min-w-0 space-y-6 sm:space-y-8">
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <FileVideo className="mb-3 h-7 w-7 text-primary sm:mb-4 sm:h-8 sm:w-8" />
              <p className="text-sm font-medium text-muted-foreground">Cursos Publicados</p>
              <h3 className="text-xl font-bold sm:text-2xl md:text-3xl">{data.publishedCoursesCount}</h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <Users className="mb-3 h-7 w-7 text-accent sm:mb-4 sm:h-8 sm:w-8" />
              <p className="text-sm font-medium text-muted-foreground">Total Alunos</p>
              <h3 className="text-xl font-bold sm:text-2xl md:text-3xl">{data.totalStudentsCount}</h3>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <Target className="mb-3 h-7 w-7 text-green-500 sm:mb-4 sm:h-8 sm:w-8" />
              <p className="text-sm font-medium text-muted-foreground">Taxa Conclusão Média</p>
              <h3 className="text-xl font-bold sm:text-2xl md:text-3xl">{formatPercent(data.averageCompletionRate)}</h3>
            </CardContent>
          </Card>
        </div>

        {/* Courses Table */}
        <Card>
          <div className="border-b p-4 sm:p-6">
            <h2 className="font-display text-lg font-bold sm:text-xl">Performance dos Cursos</h2>
          </div>

          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead className="bg-primary/20 text-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium lg:px-6 lg:py-4">Curso</th>
                    <th className="px-4 py-3 font-medium lg:px-6 lg:py-4">Status</th>
                    <th className="px-4 py-3 font-medium lg:px-6 lg:py-4">Alunos</th>
                    <th className="px-4 py-3 font-medium lg:px-6 lg:py-4">Conclusão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {data.courses.map((course) => (
                    <tr key={course.id} className="transition-colors hover:bg-muted/40">
                      <td className="px-4 py-3 font-medium text-foreground lg:px-6 lg:py-4">{course.title}</td>
                      <td className="px-4 py-3 lg:px-6 lg:py-4">
                        <span className={`rounded-md px-2.5 py-1 text-xs font-bold tracking-wide ${getStatusBadgeClass(course.status)}`}>
                          {getStatusLabel(course.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground/90 lg:px-6 lg:py-4">{course.enrollmentCount}</td>
                      <td className="px-4 py-3 text-foreground/90 lg:px-6 lg:py-4">{formatPercent(course.completionRate)}</td>
                    </tr>
                  ))}
                  {data.courses.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                        Nenhum curso criado ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 p-4 md:hidden">
            {data.courses.map((course) => (
              <div
                key={course.id}
                className="rounded-lg border border-border bg-muted/40 p-4 shadow-sm"
              >
                <p className="mb-2 font-medium text-foreground">{course.title}</p>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className={`rounded-md px-2.5 py-1 text-xs font-bold tracking-wide ${getStatusBadgeClass(course.status)}`}>
                    {getStatusLabel(course.status)}
                  </span>
                  <span>
                    <strong className="text-foreground">{course.enrollmentCount}</strong> alunos
                  </span>
                  <span>
                    <strong className="text-foreground">{formatPercent(course.completionRate)}</strong> conclusão
                  </span>
                </div>
              </div>
            ))}
            {data.courses.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">Nenhum curso criado ainda.</p>
            )}
          </div>
        </Card>

      </div>
    </AppLayout>
  );
}
