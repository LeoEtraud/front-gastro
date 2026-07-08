import { useNavigate, useParams } from 'react-router-dom';
import { usePublicCourse } from '@/hooks/use-courses';
import { useAuth } from '@/hooks/use-auth';
import { useEnrollInCourse } from '@/hooks/use-student';
import { Clock, PlayCircle, ShieldCheck, ChevronDown, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useDelayedFlag } from '@/hooks/use-delayed-flag';
import { CourseDetailPageSkeleton } from '@/components/ui/content-skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import { normalizePtBrText } from '@/lib/normalize-ptbr';

const levelLabel: Record<string, string> = {
  BASIC: 'Básico',
  BEGINNER: 'Básico',
  INTERMEDIATE: 'Intermediário',
  ADVANCED: 'Avançado',
};

function formatCourseLevel(level?: string) {
  if (!level) return '';
  const normalized = level.trim().toUpperCase();
  const translated = levelLabel[normalized];
  if (translated) return translated;
  return normalizePtBrText(level);
}

export default function CourseDetail() {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  const courseId = id ?? '';
  const { data: course, isLoading } = usePublicCourse(courseId);
  const showLoading = useDelayedFlag(isLoading);
  const { user } = useAuth();
  const enroll = useEnrollInCourse();
  const { toast } = useToast();

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
      return;
    }
    navigate('/courses');
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'STUDENT') {
      toast({
        variant: "warning",
        title: "Apenas alunos podem se inscrever",
        description: "Redirecionando para seu painel.",
      });
      navigate(user.role === 'TEACHER' || user.role === 'ADMIN' ? '/teacher/dashboard' : '/');
      return;
    }
    try {
      if (!courseId) return;
      await enroll.mutateAsync(courseId);
      toast({
        variant: "success",
        title: "Inscrição confirmada!",
        description: "Bem-vindo ao curso.",
      });
      navigate('/student/courses');
    } catch (e: any) {
      if (e?.response?.status === 409) {
        toast({
          variant: "warning",
          title: "Você já está inscrito neste curso",
          description: "Redirecionando para seus cursos.",
        });
        navigate('/student/courses');
        return;
      }
      toast({ variant: "destructive", title: "Erro", description: e.response?.data?.error || "Falha ao se inscrever." });
    }
  };

  if (isLoading && showLoading) {
    return (
      <div className="min-h-dvh overflow-x-hidden bg-slate-50 pb-12 sm:pb-20">
        <div className="bg-sidebar py-12 sm:py-16 md:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-3 md:gap-10 lg:px-8">
            <div className="space-y-4 md:col-span-2">
              <Skeleton className="h-8 w-20 bg-white/20" />
              <Skeleton className="h-12 w-4/5 bg-white/25" />
              <Skeleton className="h-6 w-3/5 bg-white/20" />
            </div>
            <div className="rounded-xl bg-white p-5 sm:p-6">
              <Skeleton className="mb-6 h-10 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (isLoading) return <CourseDetailPageSkeleton />;
  if (!course) return <div className="p-20 text-center">Curso não encontrado.</div>;

  return (
    <div className="min-h-dvh overflow-x-hidden bg-slate-50 pb-12 sm:pb-20">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-sidebar py-12 text-white sm:py-16 md:py-20">
        <div className="absolute inset-0 opacity-20">
          {course.coverImageUrl && (
            <img
              src={course.coverImageUrl}
              className="h-full w-full object-cover blur-sm"
              alt=""
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 md:grid-cols-3 md:gap-10 lg:px-8">
          <div className="min-w-0 md:col-span-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mb-3 h-8 w-8 rounded-full bg-slate-700 text-white hover:bg-slate-800 sm:mb-4"
              onClick={handleGoBack}
              aria-label="Voltar"
              title="Voltar"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
            <div className="mb-3 flex flex-wrap gap-2 sm:mb-4">
              <Badge variant="outline" className="border-white/30 text-white">
                {course.specialty}
              </Badge>
              <Badge className="bg-primary/20 text-blue-200 hover:bg-primary/30">{formatCourseLevel(course.level)}</Badge>
            </div>
            <h1 className="mb-3 font-display text-2xl font-bold text-white sm:mb-4 sm:text-3xl md:text-4xl lg:text-5xl">
              {normalizePtBrText(course.title)}
            </h1>
            <p className="mb-5 text-base leading-relaxed text-slate-300 sm:mb-6 sm:text-lg md:text-xl">
              {normalizePtBrText(course.subtitle)}
            </p>

            <ul className="flex flex-col gap-3 text-sm text-slate-300 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2">
              <li className="flex items-center gap-2">
                <Clock className="h-5 w-5 shrink-0" aria-hidden /> {course.workloadHours} horas
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden /> Certificado incluso
              </li>
            </ul>
          </div>

          <div className="relative z-20 rounded-xl bg-white p-5 text-slate-900 shadow-2xl sm:p-6">
            <Button
              size="lg"
              className="mb-4 h-12 w-full text-base shadow-lg shadow-primary/25 sm:h-14 sm:text-lg"
              onClick={handleEnroll}
              isLoading={enroll.isPending}
            >
              Inscrever-se Agora
            </Button>
            <p className="text-xs text-center text-slate-500">Acesso imediato a todo o conteúdo</p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl grid gap-10 px-4 sm:mt-12 sm:px-6 md:grid-cols-3 md:gap-12 lg:px-8">
        <div className="min-w-0 space-y-10 md:col-span-2 md:space-y-12">
          {/* About */}
          <section>
            <h2 className="mb-3 font-display text-xl font-bold sm:mb-4 sm:text-2xl">Sobre o Curso</h2>
            <div className="prose prose-slate max-w-none text-slate-600">
              <p>{normalizePtBrText(course.description || course.shortDescription)}</p>
            </div>
          </section>

          {/* Curriculum */}
          <section>
            <h2 className="mb-4 font-display text-xl font-bold sm:mb-6 sm:text-2xl">Conteúdo Programático</h2>
            <div className="space-y-4">
              {course.modules?.map((mod, i) => (
                <Card key={mod.id} className="border-slate-200">
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 font-semibold sm:p-5 touch-manipulation">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">{i + 1}</div>
                        {normalizePtBrText(mod.title)}
                      </div>
                      <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="px-5 pb-5 pt-0 border-t border-slate-100">
                      <ul className="mt-3 space-y-3">
                        {mod.lessons?.map(lesson => (
                          <li key={lesson.id} className="flex items-center gap-3 text-slate-600 text-sm">
                            <PlayCircle className="w-4 h-4 text-slate-400" />
                            {normalizePtBrText(lesson.title)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                </Card>
              ))}
              {(!course.modules || course.modules.length === 0) && (
                <p className="text-slate-500 italic">Conteúdo em elaboração.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
