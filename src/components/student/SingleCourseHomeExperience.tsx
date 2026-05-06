import { useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  StudentDashboardFacultyMember,
  StudentDashboardLessonPreview,
  StudentDashboardMural,
  StudentDashboardSingleCourseHome,
} from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Award,
  BookMarked,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Languages,
  LayoutList,
  MapPin,
  PlayCircle,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { normalizePtBrText } from '@/lib/normalize-ptbr';
import { resolveApiUrl } from '@/lib/axios';
import { cn } from '@/lib/utils';

/** Miniatura oficial do YouTube quando a aula usa `videoUrl` externo. */
function youtubePosterUrl(videoUrl: string): string | null {
  try {
    const u = new URL(videoUrl);
    if (u.hostname.includes('youtu.be')) {
      const id = u.pathname.replace(/^\//, '').split('/')[0];
      return id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : null;
    }
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://i.ytimg.com/vi/${v}/mqdefault.jpg`;
      const m = u.pathname.match(/\/embed\/([^/?]+)/);
      if (m?.[1]) return `https://i.ytimg.com/vi/${m[1]}/mqdefault.jpg`;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function formatDuration(seconds: number | null | undefined): string | null {
  if (seconds == null || seconds <= 0) return null;
  const m = Math.round(seconds / 60);
  return `${m} min`;
}

function lessonStatusLabel(status: StudentDashboardLessonPreview['status']): string {
  if (status === 'COMPLETED') return 'Concluída';
  if (status === 'COMING_SOON') return 'Em breve';
  return 'Disponível';
}

function LessonPreviewCard({
  courseId,
  lesson,
  className,
  visualOnly = false,
}: {
  courseId: string;
  lesson: StudentDashboardLessonPreview;
  className?: string;
  /** Preview compacto (player + informações úteis abaixo). */
  visualOnly?: boolean;
}) {
  const dur = formatDuration(lesson.duration);
  const label = `${normalizePtBrText(lesson.title)} — ${normalizePtBrText(lesson.moduleTitle)}`;
  const ytPoster = lesson.videoUrl ? youtubePosterUrl(lesson.videoUrl) : null;
  const hostedSrc = lesson.videoPreviewUrl ? resolveApiUrl(lesson.videoPreviewUrl) : null;

  const playerArea = (
    <div
      className={cn(
        'relative w-full shrink-0 overflow-hidden bg-gradient-to-br from-primary/25 via-primary/10 to-muted',
        visualOnly ? 'aspect-[16/8.7]' : 'h-[5.5rem] sm:h-[6.5rem]',
      )}
    >
      {ytPoster ? (
        <img
          src={ytPoster}
          alt=""
          loading="lazy"
          className="absolute inset-0 z-[1] h-full w-full object-cover"
        />
      ) : hostedSrc ? (
        <video
          src={hostedSrc}
          muted
          playsInline
          preload="metadata"
          className="pointer-events-none absolute inset-0 z-[1] h-full w-full object-cover"
          aria-hidden
        />
      ) : null}
      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/45 via-black/10 to-transparent" aria-hidden />
      <div className="absolute inset-0 z-[3] flex items-center justify-center">
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-background/90 text-primary shadow-md ring-2 ring-primary/15 transition-transform group-hover:scale-105',
            visualOnly ? 'h-11 w-11 sm:h-12 sm:w-12' : 'h-10 w-10 sm:h-11 sm:w-11',
          )}
        >
          <PlayCircle className={cn(visualOnly ? 'h-6 w-6 sm:h-7 sm:w-7' : 'h-5 w-5 sm:h-6 sm:w-6')} aria-hidden />
        </div>
      </div>
      {visualOnly ? null : (
        <Badge
          variant="secondary"
          className="absolute left-1.5 top-1.5 z-[4] bg-background/90 px-1.5 py-0 text-[10px] font-semibold backdrop-blur-sm sm:left-2 sm:top-2 sm:text-[11px]"
        >
          {lessonStatusLabel(lesson.status)}
        </Badge>
      )}
      {dur ? (
        <span
          className={cn(
            'absolute z-[4] rounded bg-black/60 font-medium text-white',
            visualOnly
              ? 'bottom-2 right-2 px-2 py-0.5 text-[11px] sm:text-xs'
              : 'bottom-1 right-1.5 px-1.5 py-0.5 text-[10px] sm:bottom-1.5 sm:text-[11px]',
          )}
        >
          {dur}
        </span>
      ) : null}
    </div>
  );

  return (
    <Link
      to={`/student/courses/${courseId}/lessons/${lesson.id}`}
      className={cn('group block min-w-0', className)}
      aria-label={label}
    >
      <Card
        className={cn(
          'overflow-hidden border-border/80 transition-shadow hover:shadow-md',
          visualOnly ? 'p-0' : 'flex h-full flex-col',
        )}
      >
        {playerArea}
        {visualOnly ? (
          <CardContent className="space-y-1.5 p-2 sm:p-2.5">
            <h3 className="line-clamp-2 font-display text-xs font-bold leading-snug text-foreground sm:text-sm">
              {normalizePtBrText(lesson.title)}
            </h3>
          </CardContent>
        ) : (
          <CardContent className="flex flex-1 flex-col gap-1.5 p-2.5 sm:p-3">
            <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground sm:text-[10px]">
              {normalizePtBrText(lesson.moduleTitle)}
            </p>
            <h3 className="line-clamp-2 font-display text-xs font-bold leading-snug text-foreground sm:text-sm">
              {normalizePtBrText(lesson.title)}
            </h3>
            {lesson.description ? (
              <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground sm:text-xs">
                {normalizePtBrText(lesson.description)}
              </p>
            ) : null}
            <div className="mt-auto flex flex-wrap items-center gap-1 pt-0.5">
              <Badge variant="outline" className="px-1.5 py-0 text-[9px] sm:text-[10px]">
                {lesson.type}
              </Badge>
              {lesson.isCompleted ? (
                <Badge className="bg-green-600 px-1.5 py-0 text-[9px] hover:bg-green-600 sm:text-[10px]">Assistida</Badge>
              ) : null}
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}

function TagList({ label, items, max = 6 }: { label: string; items: string[]; max?: number }) {
  if (!items.length) return null;
  const shown = items.slice(0, max);
  const more = items.length - shown.length;
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1">
        {shown.map((t) => (
          <Badge key={t} variant="secondary" className="max-w-full truncate px-1.5 py-0 text-[10px] font-normal">
            {normalizePtBrText(t)}
          </Badge>
        ))}
        {more > 0 ? (
          <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
            +{more}
          </Badge>
        ) : null}
      </div>
    </div>
  );
}

function FacultyCard({
  member,
  courseTitle,
}: {
  member: StudentDashboardFacultyMember;
  courseTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const initials = member.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-left outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Card className="h-full border-border/80 transition-all hover:border-primary/40 hover:shadow-sm">
          <CardHeader className="space-y-0 p-3 pb-2 sm:p-3.5">
            <div className="flex items-start gap-2.5">
              <Avatar className="h-10 w-10 shrink-0 border border-primary/15 sm:h-11 sm:w-11">
                {member.avatarUrl ? <AvatarImage src={member.avatarUrl} alt="" /> : null}
                <AvatarFallback className="bg-primary/10 font-display text-xs font-bold text-primary sm:text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-0.5">
                <CardTitle className="font-display text-sm font-bold leading-tight sm:text-base">
                  {normalizePtBrText(member.name)}
                </CardTitle>
                {member.headline ? (
                  <p className="line-clamp-1 text-[11px] font-medium text-primary sm:text-xs">{normalizePtBrText(member.headline)}</p>
                ) : null}
                {member.facultyRole ? (
                  <p className="line-clamp-1 text-[10px] text-muted-foreground sm:text-[11px]">{normalizePtBrText(member.facultyRole)}</p>
                ) : null}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 p-3 pt-0 text-sm sm:p-3.5 sm:pt-0">
            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground sm:line-clamp-3">{normalizePtBrText(member.bioShort)}</p>
            <TagList label="Especializações" items={member.specializations} max={3} />
            <TagList label={`Temas no curso`} items={member.courseThemes} max={2} />
            <p className="flex items-center gap-0.5 pt-0.5 text-[11px] font-medium text-primary sm:text-xs">
              Perfil completo
              <ChevronRight className="h-3 w-3" aria-hidden />
            </p>
          </CardContent>
        </Card>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-lg">
          <ScrollArea className="h-full max-h-[100dvh]">
            <div className="space-y-6 p-6">
              <SheetHeader className="space-y-3 text-left">
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20 border-2 border-primary/20">
                    {member.avatarUrl ? <AvatarImage src={member.avatarUrl} alt="" /> : null}
                    <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <SheetTitle className="font-display text-xl leading-tight">
                      {normalizePtBrText(member.name)}
                    </SheetTitle>
                    <SheetDescription className="text-left">
                      {member.specialty ? normalizePtBrText(member.specialty) : 'Professor(a)'}
                      {member.facultyRole ? ` · ${normalizePtBrText(member.facultyRole)}` : ''}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <Separator />

              <section className="space-y-2">
                <h4 className="flex items-center gap-2 text-sm font-bold">
                  <Users className="h-4 w-4 text-primary" aria-hidden />
                  Biografia
                </h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {normalizePtBrText(member.bioFull || member.bioShort)}
                </p>
              </section>

              {member.academicFormation ? (
                <section className="space-y-2">
                  <h4 className="flex items-center gap-2 text-sm font-bold">
                    <GraduationCap className="h-4 w-4 text-primary" aria-hidden />
                    Formação acadêmica
                  </h4>
                  <p className="text-sm text-muted-foreground">{normalizePtBrText(member.academicFormation)}</p>
                </section>
              ) : null}

              {member.certifications.length > 0 ? (
                <section className="space-y-2">
                  <h4 className="flex items-center gap-2 text-sm font-bold">
                    <Award className="h-4 w-4 text-primary" aria-hidden />
                    Certificações
                  </h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    {member.certifications.map((c) => (
                      <li key={c}>{normalizePtBrText(c)}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {member.achievements.length > 0 ? (
                <section className="space-y-2">
                  <h4 className="flex items-center gap-2 text-sm font-bold">
                    <Sparkles className="h-4 w-4 text-primary" aria-hidden />
                    Principais conquistas
                  </h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                    {member.achievements.map((c) => (
                      <li key={c}>{normalizePtBrText(c)}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {member.socialLinks.length > 0 ? (
                <section className="space-y-2">
                  <h4 className="text-sm font-bold">Links profissionais</h4>
                  <div className="flex flex-wrap gap-2">
                    {member.socialLinks.map((l) => (
                      <a
                        key={l.url}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'inline-flex gap-1')}
                      >
                        {l.label}
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      </a>
                    ))}
                  </div>
                </section>
              ) : null}

              {member.taughtLessons.length > 0 ? (
                <section className="space-y-2">
                  <h4 className="flex items-center gap-2 text-sm font-bold">
                    <BookMarked className="h-4 w-4 text-primary" aria-hidden />
                    Aulas e módulos no curso
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {member.taughtLessons.map((t, i) => (
                      <li key={`${t.lessonTitle}-${i}`} className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                        <span className="font-medium text-foreground">{normalizePtBrText(t.lessonTitle)}</span>
                        <span className="text-muted-foreground"> — {normalizePtBrText(t.moduleTitle)}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {member.languagesSpoken.length > 0 ? (
                <section className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Languages className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="font-medium text-foreground">Idiomas:</span>
                  {member.languagesSpoken.join(', ')}
                </section>
              ) : null}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}

function PlaceholderFacultyCard({ index }: { index: number }) {
  return (
    <Card className="flex min-h-[8.5rem] flex-col items-center justify-center border-dashed border-muted-foreground/20 bg-muted/15 px-3 py-5 text-center sm:min-h-[9rem]">
      <Users className="mb-1.5 h-7 w-7 text-muted-foreground/45" aria-hidden />
      <p className="text-xs font-medium text-muted-foreground">Professor {index + 1}</p>
      <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground/85">A definir.</p>
    </Card>
  );
}

function InfoMural({ courseId, mural, courseTitle }: { courseId: string; mural: StudentDashboardMural; courseTitle: string }) {
  return (
    <Card className="flex h-full max-h-[23rem] flex-col border-primary/15 bg-gradient-to-b from-card to-primary/[0.02] sm:max-h-[24rem]">
      <CardHeader className="space-y-0.5 px-3 py-2.5 sm:px-3.5 sm:py-3">
        <CardTitle className="flex items-center gap-1.5 font-display text-sm font-bold sm:text-base">
          <Target className="h-4 w-4 shrink-0 text-primary sm:h-4 sm:w-4" aria-hidden />
          Mural do curso
        </CardTitle>
        <p className="text-[10px] text-muted-foreground sm:text-xs">«{normalizePtBrText(courseTitle)}»</p>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-2 px-3 pb-3 pt-0 text-sm overflow-y-auto sm:px-3.5 sm:pb-3.5">
        <div>
          <div className="mb-0.5 flex justify-between text-[10px] font-medium text-muted-foreground sm:text-xs">
            <span>Progresso</span>
            <span>{Math.round(mural.progressPercent)}%</span>
          </div>
          <Progress value={mural.progressPercent} className="h-1.5" />
          <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground sm:text-xs">
            {mural.stats.completedLessons}/{mural.stats.totalPublishedLessons} aulas concluídas
            {mural.stats.comingSoonLessons > 0 ? ` · ${mural.stats.comingSoonLessons} em breve` : ''}
          </p>
        </div>

        <Separator className="my-0" />

        {mural.recommended ? (
          <div className="rounded-md border border-primary/20 bg-primary/5 px-2.5 py-2 sm:px-3">
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">Recomendada</p>
            <Link
              to={`/student/courses/${courseId}/lessons/${mural.recommended.lessonId}`}
              className="group flex items-start justify-between gap-2 text-sm font-medium leading-snug text-foreground hover:text-primary"
            >
              <span className="line-clamp-2">{normalizePtBrText(mural.recommended.title)}</span>
              <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{normalizePtBrText(mural.recommended.moduleTitle)}</p>
          </div>
        ) : null}

        <div>
          <p className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            <LayoutList className="h-3 w-3" aria-hidden />
            Próximas aulas
          </p>
          <ul className="max-h-[7.5rem] space-y-1 overflow-y-auto pr-0.5 text-[11px] sm:max-h-[8.5rem] sm:text-xs">
            {mural.nextUp.length === 0 ? (
              <li className="text-muted-foreground">Nada além do bloco inicial.</li>
            ) : (
              mural.nextUp.slice(0, 4).map((l) => (
                <li key={l.lessonId}>
                  <Link
                    to={`/student/courses/${courseId}/lessons/${l.lessonId}`}
                    className="flex items-center justify-between gap-1.5 rounded px-0.5 py-0.5 hover:bg-muted/80"
                  >
                    <span className="line-clamp-2 font-medium leading-snug">{normalizePtBrText(l.title)}</span>
                    <Badge variant="outline" className="shrink-0 px-1 py-0 text-[9px]">
                      {lessonStatusLabel(l.status)}
                    </Badge>
                  </Link>
                  <span className="block pl-0.5 text-[9px] text-muted-foreground">{normalizePtBrText(l.moduleTitle)}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Módulos</p>
          <ul className="grid gap-1 text-[11px] sm:grid-cols-2 sm:text-xs">
            {mural.modulesSummary.slice(0, 4).map((m) => (
              <li key={m.moduleId} className="flex justify-between gap-1 rounded bg-muted/35 px-1.5 py-1">
                <span className="line-clamp-1 min-w-0 font-medium">{normalizePtBrText(m.title)}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {m.completedLessons}/{m.publishedLessons}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {mural.complementary.length > 0 ? (
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Materiais</p>
            <ul className="space-y-0.5 text-[11px] sm:text-xs">
              {mural.complementary.slice(0, 4).map((c) => (
                <li key={c.lessonId} className="truncate">
                  <Link to={`/student/courses/${courseId}/lessons/${c.lessonId}`} className="text-primary hover:underline">
                    {normalizePtBrText(c.title)}
                  </Link>
                  <span className="text-muted-foreground"> · {c.type}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Avisos</p>
          <ul className="space-y-1 text-[10px] text-muted-foreground sm:text-[11px]">
            {mural.bulletins.slice(0, 2).map((b, i) => (
              <li key={i} className="flex gap-1.5 rounded border border-border/40 bg-background/60 px-2 py-1.5 leading-snug">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-primary" aria-hidden />
                <span className="line-clamp-3">{normalizePtBrText(b)}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

type Props = { home: StudentDashboardSingleCourseHome };

export function SingleCourseHomeExperience({ home }: Props) {
  const facultySlots: (StudentDashboardFacultyMember | null)[] = [...home.faculty];
  while (facultySlots.length < 4) facultySlots.push(null);

  return (
    <div className="space-y-4 sm:space-y-5">
      <section aria-labelledby="faculty-heading" className="space-y-2 sm:space-y-2.5">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <h2 id="faculty-heading" className="font-display text-base font-bold text-foreground sm:text-lg">
            Corpo docente
          </h2>
          <p className="max-w-2xl text-[11px] leading-snug text-muted-foreground sm:text-xs">
            Toque para ver formação, certificações e aulas ligadas a cada professor.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
          {facultySlots.slice(0, 4).map((member, idx) =>
            member ? (
              <FacultyCard key={member.userId} member={member} courseTitle={home.courseTitle} />
            ) : (
              <PlaceholderFacultyCard key={`ph-${idx}`} index={idx} />
            ),
          )}
        </div>
      </section>

      <section aria-labelledby="lessons-heading" className="space-y-2 sm:space-y-2.5">
        <h2 id="lessons-heading" className="font-display text-base font-bold sm:text-lg">
          Início do módulo — aulas em destaque
        </h2>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 md:grid-cols-3">
          {home.lessonRowTop.map((lesson) => (
            <LessonPreviewCard key={lesson.id} courseId={home.courseId} lesson={lesson} visualOnly />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-3">
          {home.lessonFourth ? (
            <LessonPreviewCard
              courseId={home.courseId}
              lesson={home.lessonFourth}
              className="md:col-span-1"
              visualOnly
            />
          ) : (
            <Card className="flex min-h-[6rem] items-center justify-center border-dashed px-3 text-center text-xs text-muted-foreground md:col-span-1 sm:text-sm">
              <p>Sem quarta aula publicada neste módulo.</p>
            </Card>
          )}
          <div className="md:col-span-2 md:min-h-0">
            <InfoMural courseId={home.courseId} mural={home.mural} courseTitle={home.courseTitle} />
          </div>
        </div>
      </section>
    </div>
  );
}
