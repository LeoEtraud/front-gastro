import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStudentLesson, useMarkLessonProgress } from '@/hooks/use-student';
import { usePublicCourse } from '@/hooks/use-courses';
import type { LessonWithProgress } from '@/types/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { ArrowLeft, CheckCircle2, FileText, Loader2, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LessonVimeoPlayer } from '@/components/video/LessonVimeoPlayer';
import { COURSE_MATERIALS_DRIVE_URL } from '@/lib/course-materials-config';
import { CompactContentSkeleton, LessonViewerSkeleton } from '@/components/ui/content-skeletons';
import { useDelayedFlag } from '@/hooks/use-delayed-flag';
import { normalizePtBrText } from '@/lib/normalize-ptbr';

function toYoutubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
      const m = u.pathname.match(/\/embed\/([^/?]+)/);
      if (m?.[1]) return `https://www.youtube.com/embed/${m[1]}`;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function LessonVideoPanel({
  lesson,
  courseId,
  loading,
}: {
  lesson: LessonWithProgress;
  courseId: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="relative aspect-video w-full shrink-0 bg-black/85">
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-white/80" />
        </div>
      </div>
    );
  }

  const placeholder = (
    <div className="relative flex aspect-video w-full shrink-0 items-center justify-center bg-muted px-6 text-center">
      <FileText className="mb-2 h-12 w-12 text-muted-foreground/50" />
    </div>
  );

  const migrationMessage = (
    <div className="relative flex aspect-video w-full shrink-0 flex-col items-center justify-center gap-2 bg-muted px-6 text-center">
      <PlayCircle className="h-12 w-12 text-muted-foreground/50" />
      <p className="max-w-md text-sm text-muted-foreground">
        O vídeo desta aula ainda está sendo migrado para a nova plataforma. Tente novamente em breve ou
        entre em contato com o suporte.
      </p>
    </div>
  );

  if (lesson.hasVimeoVideo) {
    return (
      <LessonVimeoPlayer
        courseId={courseId}
        lessonId={lesson.id}
        active
        className="relative aspect-video w-full shrink-0"
      />
    );
  }

  if (lesson.videoMigrationPending) {
    return migrationMessage;
  }

  if (lesson.videoUrl) {
    const embed = toYoutubeEmbed(lesson.videoUrl);
    if (embed) {
      return (
        <div className="relative aspect-video w-full shrink-0 bg-black">
          <iframe
            src={embed}
            className="absolute inset-0 h-full w-full border-0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Vídeo da aula"
          />
        </div>
      );
    }
  }

  if (lesson.type !== 'VIDEO') {
    return placeholder;
  }

  return (
    <div className="relative flex aspect-video w-full shrink-0 flex-col items-center justify-center gap-2 bg-muted px-6 text-center">
      <PlayCircle className="h-12 w-12 text-muted-foreground/50" />
      <p className="max-w-md text-sm text-muted-foreground">Nenhum vídeo configurado para esta aula.</p>
    </div>
  );
}

export default function LessonViewer() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();

  const { data: course } = usePublicCourse(courseId ?? '');

  let actualLessonId = lessonId ?? '';
  if (lessonId === 'start' && course?.modules?.[0]?.lessons?.[0]) {
    actualLessonId = course.modules[0].lessons[0].id;
  }

  const { data: lesson, isLoading, isFetching, isPlaceholderData } = useStudentLesson(actualLessonId);
  const showCourseLoading = useDelayedFlag(!course);
  const showLessonLoading = useDelayedFlag(isLoading);
  const markProgress = useMarkLessonProgress();
  const { toast } = useToast();

  const handleGoBack = () => {
    navigate('/student/courses');
  };

  const handleComplete = async () => {
    try {
      await markProgress.mutateAsync({ lessonId: actualLessonId, isCompleted: !lesson?.isCompleted });
      toast(
        lesson?.isCompleted
          ? { variant: 'warning', title: 'Marcado como não concluído' }
          : { variant: 'success', title: 'Aula concluída!' },
      );
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao salvar progresso' });
    }
  };

  if (!course) {
    if (!showCourseLoading) {
      return (
        <AppLayout>
          <CompactContentSkeleton />
        </AppLayout>
      );
    }
    return (
      <AppLayout>
        <LessonViewerSkeleton />
      </AppLayout>
    );
  }
  if (isLoading && !lesson) {
    if (!showLessonLoading) {
      return (
        <AppLayout>
          <CompactContentSkeleton />
        </AppLayout>
      );
    }
    return (
      <AppLayout>
        <LessonViewerSkeleton />
      </AppLayout>
    );
  }
  if (!lesson) return <AppLayout><div className="p-20 text-center">Aula não encontrada.</div></AppLayout>;
  const isLessonSwitching = isFetching && (isPlaceholderData || lesson.id !== actualLessonId);

  return (
    <AppLayout>
      <div className="flex w-full min-w-0 flex-col gap-4 lg:min-h-[min(100%,calc(100dvh-5rem))] lg:flex-row lg:gap-6">
        <div className="order-2 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground lg:order-2 lg:min-h-[min(100%,calc(100dvh-5rem))]">
          <div className="shrink-0 overflow-hidden rounded-t-xl">
            <LessonVideoPanel lesson={lesson} courseId={courseId ?? ''} loading={isLessonSwitching} />
          </div>

          <div className="min-h-0 flex-1 rounded-b-xl border-t border-border p-4 sm:p-6 md:p-8 lg:overflow-y-auto">
            <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0 text-card-foreground">
                <h1 className="mb-1 font-display text-xl font-bold text-card-foreground sm:text-2xl">{normalizePtBrText(lesson.title)}</h1>
                <p className="text-sm text-muted-foreground">Aula de Módulo</p>
              </div>
              <Button
                onClick={handleComplete}
                variant="default"
                className={`w-full shrink-0 sm:w-auto ${lesson.isCompleted ? '!border-green-900 !bg-green-800 !text-white hover:!border-green-950 hover:!bg-green-900 hover:!text-white disabled:!opacity-100 dark:!border-green-800 dark:!bg-green-700 dark:!text-white dark:hover:!bg-green-800' : ''}`}
                isLoading={markProgress.isPending}
                disabled={isLessonSwitching}
              >
                <CheckCircle2 className="mr-2 h-4 w-4 shrink-0" />
                {lesson.isCompleted ? 'Concluída' : 'Marcar como Concluída'}
              </Button>
            </div>

            <div className="prose prose-sm max-w-none text-card-foreground/90 prose-headings:text-card-foreground prose-p:text-card-foreground/90 sm:prose-base dark:prose-invert">
              {lesson.description ? (
                <p>{normalizePtBrText(lesson.description)}</p>
              ) : (
                <p className="italic text-muted-foreground">Nenhuma descrição adicional para esta aula.</p>
              )}
            </div>

            {lesson.type === 'QUIZ' && lesson.quiz && (
              <div className="mt-8 rounded-xl border border-primary/25 bg-primary/10 p-4 text-center sm:mt-10 sm:p-6">
                <h3 className="mb-2 text-lg font-bold text-card-foreground sm:text-xl">{normalizePtBrText(lesson.quiz.title)}</h3>
                <p className="mb-4 text-sm text-muted-foreground sm:mb-6 sm:text-base">
                  Avaliação com {lesson.quiz.questions.length} questões. Nota para passar: {lesson.quiz.passingScore}%
                </p>
                <Button className="w-full sm:w-auto">Iniciar Avaliação</Button>
              </div>
            )}
          </div>
        </div>

        <aside className="order-1 flex max-h-[min(42vh,20rem)] w-full shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card lg:order-1 lg:max-h-none lg:h-auto lg:max-h-[min(100%,calc(100dvh-5rem))] lg:w-80">
          <div className="shrink-0 border-b border-border bg-muted/50 p-3 sm:p-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mb-1 h-8 w-8 rounded-full bg-slate-700 text-white hover:bg-slate-800 sm:mb-2"
              onClick={handleGoBack}
              aria-label="Voltar"
              title="Voltar"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 min-w-0 flex-1 font-display text-sm font-bold text-foreground sm:text-base">
                {normalizePtBrText(course.title)}
              </h3>
              <a
                href={COURSE_MATERIALS_DRIVE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                aria-label="Materiais complementares"
                title="Materiais complementares"
              >
                <FileText className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-y-contain p-2 sm:space-y-4">
            {course.modules?.map((mod, i) => (
              <div key={mod.id}>
                <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:px-3 sm:py-2 sm:text-xs">
                  Módulo {i + 1}
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  {mod.lessons?.map((l) => (
                    <Link
                      key={l.id}
                      to={`/student/courses/${course.id}/lessons/${l.id}`}
                      className={`flex w-full min-h-11 cursor-pointer items-start gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors touch-manipulation sm:gap-3 sm:px-3 sm:py-2.5 ${l.id === actualLessonId ? 'bg-primary/10 font-medium text-primary' : 'text-foreground/90 hover:bg-muted hover:text-foreground'}`}
                    >
                      {l.type === 'VIDEO' ? (
                        <PlayCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                      ) : (
                        <FileText className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                      )}
                      <span className="line-clamp-2">{normalizePtBrText(l.title)}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </AppLayout>
  );
}
