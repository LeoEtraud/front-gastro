import { useEffect, useRef, useState, type MouseEventHandler } from 'react';
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
  Captions,
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
  Volume2,
  VolumeX,
} from 'lucide-react';
import { normalizePtBrText } from '@/lib/normalize-ptbr';
import { resolveApiUrl } from '@/lib/axios';
import { cn } from '@/lib/utils';

/** Miniatura oficial do YouTube quando a aula usa `videoUrl` externo. */
function youtubePosterUrl(videoUrl: string): string | null {
  const id = youtubeVideoId(videoUrl);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

function youtubeVideoId(videoUrl: string): string | null {
  try {
    const u = new URL(videoUrl);
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.replace(/^\//, '').split('/')[0] || null;
    }
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return v;
      const m = u.pathname.match(/\/embed\/([^/?]+)/);
      if (m?.[1]) return m[1];
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
  courseTitle,
  courseCover,
  audioPreferenceEnabled,
  onAudioPreferenceChange,
  lesson,
  className,
  visualOnly = false,
}: {
  courseId: string;
  courseTitle: string;
  courseCover?: string | null;
  audioPreferenceEnabled: boolean;
  onAudioPreferenceChange: (enabled: boolean) => void;
  lesson: StudentDashboardLessonPreview;
  className?: string;
  /** Preview compacto (player + informações úteis abaixo). */
  visualOnly?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const youtubeFrameRef = useRef<HTMLIFrameElement | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isSubtitleEnabled, setIsSubtitleEnabled] = useState(false);
  const [hasSubtitleTrack, setHasSubtitleTrack] = useState(false);
  const [isYoutubeReady, setIsYoutubeReady] = useState(false);

  const dur = formatDuration(lesson.duration);
  const label = `${normalizePtBrText(courseTitle)} — ${normalizePtBrText(lesson.title)} — ${normalizePtBrText(lesson.moduleTitle)}`;
  const ytPoster = lesson.videoUrl ? youtubePosterUrl(lesson.videoUrl) : null;
  const ytVideoId = lesson.videoUrl ? youtubeVideoId(lesson.videoUrl) : null;
  const hostedSrc = lesson.videoPreviewUrl ? resolveApiUrl(lesson.videoPreviewUrl) : null;
  const canPreview = Boolean(hostedSrc || ytVideoId);
  const isYoutubePreview = Boolean(!hostedSrc && ytVideoId && isHovering);
  const canToggleSubtitle = Boolean(ytVideoId || hasSubtitleTrack);
  const youtubePreviewSrc = ytVideoId
    ? `https://www.youtube.com/embed/${ytVideoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1&loop=1&playlist=${ytVideoId}&cc_load_policy=1&cc_lang_pref=pt&enablejsapi=1`
    : null;

  const sendYoutubeCommand = (func: string, args: unknown[] = []) => {
    if (!youtubeFrameRef.current?.contentWindow) return;
    youtubeFrameRef.current.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func, args }),
      '*',
    );
  };

  const applyYoutubePreferences = (audioEnabled: boolean, subtitleEnabled: boolean) => {
    sendYoutubeCommand(audioEnabled ? 'unMute' : 'mute');
    sendYoutubeCommand('setVolume', [audioEnabled ? 100 : 0]);
    if (subtitleEnabled) {
      sendYoutubeCommand('loadModule', ['captions']);
      sendYoutubeCommand('setOption', ['captions', 'track', { languageCode: 'pt' }]);
      return;
    }
    sendYoutubeCommand('unloadModule', ['captions']);
  };

  useEffect(() => {
    if (!videoRef.current?.textTracks) return;
    for (let i = 0; i < videoRef.current.textTracks.length; i += 1) {
      videoRef.current.textTracks[i].mode = isSubtitleEnabled ? 'showing' : 'disabled';
    }
  }, [isSubtitleEnabled]);

  useEffect(() => {
    if (!isYoutubePreview || !isYoutubeReady) return;
    applyYoutubePreferences(isAudioEnabled, isSubtitleEnabled);
    const retry1 = window.setTimeout(() => applyYoutubePreferences(isAudioEnabled, isSubtitleEnabled), 220);
    const retry2 = window.setTimeout(() => applyYoutubePreferences(isAudioEnabled, isSubtitleEnabled), 520);
    return () => {
      window.clearTimeout(retry1);
      window.clearTimeout(retry2);
    };
  }, [isAudioEnabled, isSubtitleEnabled, isYoutubePreview, isYoutubeReady]);

  useEffect(() => {
    if (!isYoutubePreview) return;
    setIsYoutubeReady(false);
  }, [isYoutubePreview]);

  const handlePreviewStart = async () => {
    setIsHovering(true);
    setIsAudioEnabled(audioPreferenceEnabled);
    setIsSubtitleEnabled(true);
    if (ytVideoId && !hostedSrc) return;
    if (!videoRef.current) return;
    try {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = !isAudioEnabled;
      await videoRef.current.play();
    } catch {
      /* ignore autoplay block */
    }
  };

  const handlePreviewStop = () => {
    setIsHovering(false);
    setIsAudioEnabled(audioPreferenceEnabled);
    setIsSubtitleEnabled(false);
    setIsYoutubeReady(false);
    if (youtubeFrameRef.current) {
      sendYoutubeCommand('mute');
      sendYoutubeCommand('stopVideo');
    }
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    videoRef.current.muted = true;
  };

  const handleToggleAudio: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const nextAudioEnabled = !isAudioEnabled;
    setIsAudioEnabled(nextAudioEnabled);
    onAudioPreferenceChange(nextAudioEnabled);
    if (videoRef.current) {
      videoRef.current.muted = !nextAudioEnabled;
    }
    if (isYoutubePreview && isYoutubeReady) {
      applyYoutubePreferences(nextAudioEnabled, isSubtitleEnabled);
    }
  };

  const handleToggleSubtitle: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!canToggleSubtitle) return;
    const nextSubtitleEnabled = !isSubtitleEnabled;
    setIsSubtitleEnabled(nextSubtitleEnabled);
    if (videoRef.current?.textTracks) {
      for (let i = 0; i < videoRef.current.textTracks.length; i += 1) {
        videoRef.current.textTracks[i].mode = nextSubtitleEnabled ? 'showing' : 'disabled';
      }
    }
  };

  const handleHostedMetadata = () => {
    if (!videoRef.current) return;
    setHasSubtitleTrack(videoRef.current.textTracks.length > 0);
  };

  const handleYoutubeLoaded = () => {
    setIsYoutubeReady(true);
    applyYoutubePreferences(isAudioEnabled, isSubtitleEnabled);
  };

  const playerArea = (
    <div
      className={cn(
        'relative w-full shrink-0 overflow-hidden bg-gradient-to-br from-primary/25 via-primary/10 to-muted',
        visualOnly ? 'aspect-[16/8.7]' : 'h-[5.5rem] sm:h-[6.5rem]',
      )}
      onMouseEnter={canPreview ? handlePreviewStart : undefined}
      onMouseLeave={canPreview ? handlePreviewStop : undefined}
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
          ref={videoRef}
          src={hostedSrc}
          muted
          playsInline
          preload="metadata"
          loop
          onLoadedMetadata={handleHostedMetadata}
          className={cn(
            'preview-video pointer-events-none absolute inset-0 z-[1] h-full w-full object-cover contrast-110 saturate-110 transition-transform duration-300',
            isHovering ? 'scale-[1.03]' : 'scale-100',
          )}
          aria-hidden
        />
      ) : null}
      {isYoutubePreview && youtubePreviewSrc ? (
        <iframe
          ref={youtubeFrameRef}
          src={youtubePreviewSrc}
          title={`Prévia da aula ${normalizePtBrText(lesson.title)}`}
          allow="autoplay; encrypted-media; picture-in-picture"
          className="absolute inset-0 z-[1] h-full w-full contrast-110 saturate-110"
          onLoad={handleYoutubeLoaded}
          tabIndex={-1}
          aria-hidden
        />
      ) : null}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t transition-colors duration-300',
          isHovering
            ? 'from-black/75 via-black/45 to-black/20'
            : 'from-black/50 via-black/15 to-transparent group-hover:from-black/65 group-hover:via-black/30 group-hover:to-black/15',
        )}
        aria-hidden
      />
      <div className="absolute inset-0 z-[3] flex items-center justify-center">
        <div
          className={cn(
            'flex items-center justify-center rounded-full border border-white/70 bg-white/90 text-primary shadow-xl shadow-black/30 ring-1 ring-black/10 transition-all',
            visualOnly ? 'h-12 w-12 sm:h-14 sm:w-14' : 'h-11 w-11 sm:h-12 sm:w-12',
            isHovering ? 'scale-110 opacity-0' : 'scale-100 opacity-100',
          )}
        >
          <PlayCircle className={cn(visualOnly ? 'h-7 w-7 sm:h-8 sm:w-8' : 'h-6 w-6 sm:h-7 sm:w-7')} aria-hidden />
        </div>
      </div>
      {isHovering && canPreview ? (
        <div className="absolute right-2 top-2 z-[4] flex flex-col gap-1.5">
          <button
            type="button"
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition',
              isAudioEnabled ? 'bg-white/90 text-black' : 'bg-black/70 text-white hover:bg-black/80',
            )}
            onClick={handleToggleAudio}
            aria-label={isAudioEnabled ? 'Desativar áudio da prévia' : 'Ativar áudio da prévia'}
          >
            {isAudioEnabled ? <Volume2 className="h-3.5 w-3.5" aria-hidden /> : <VolumeX className="h-3.5 w-3.5" aria-hidden />}
          </button>
          <button
            type="button"
            disabled={!canToggleSubtitle}
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition',
              canToggleSubtitle
                ? isSubtitleEnabled
                  ? 'bg-white/90 text-black'
                  : 'bg-black/70 text-white hover:bg-black/80'
                : 'cursor-not-allowed bg-black/45 text-white opacity-60',
            )}
            onClick={handleToggleSubtitle}
            aria-label={isSubtitleEnabled ? 'Desativar legenda da prévia' : 'Ativar legenda da prévia'}
          >
            <Captions className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      ) : null}
      <style>{`
        .preview-video::cue {
          font-size: 1.22rem;
          line-height: 1.45;
          font-weight: 800;
          letter-spacing: 0.01em;
          color: #ffffff;
          background: rgba(0, 0, 0, 0.86);
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9);
        }
      `}</style>
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
          'overflow-hidden border-border/80 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10',
          visualOnly ? 'p-0' : 'flex h-full flex-col',
        )}
      >
        {playerArea}
        {visualOnly ? (
          <CardContent
            className={cn(
              'space-y-2 border-t p-2 transition-colors sm:p-2.5',
              isHovering
                ? 'border-primary/45 bg-primary/10'
                : 'border-border/60 bg-gradient-to-b from-background to-muted/20',
            )}
          >
            <div className="flex items-center gap-2.5">
              <Avatar
                className={cn(
                  'h-7 w-7 border-2 shadow-sm sm:h-8 sm:w-8',
                  isHovering ? 'border-primary/70 ring-2 ring-primary/25' : 'border-border/70',
                )}
              >
                {courseCover ? <AvatarImage src={courseCover} alt={normalizePtBrText(courseTitle)} /> : null}
                <AvatarFallback className="bg-primary/10 text-[9px] font-bold text-primary sm:text-[10px]">
                  {normalizePtBrText(courseTitle).slice(0, 2).toLocaleUpperCase('pt-BR')}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h3 className="line-clamp-2 font-display text-[12px] font-bold leading-snug text-foreground sm:text-[13px]">
                  {normalizePtBrText(lesson.title).toLocaleUpperCase('pt-BR')}
                </h3>
                <p className="line-clamp-1 text-[10px] font-medium text-muted-foreground sm:text-[11px]">
                  {normalizePtBrText(courseTitle)}
                </p>
              </div>
            </div>
          </CardContent>
        ) : (
          <CardContent className="flex flex-1 flex-col gap-1.5 p-2.5 sm:p-3">
            <p className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground sm:text-[10px]">
              {normalizePtBrText(lesson.moduleTitle)}
            </p>
            <h3 className="line-clamp-2 font-display text-xs font-bold leading-snug text-foreground sm:text-sm">
              {normalizePtBrText(lesson.title).toLocaleUpperCase('pt-BR')}
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
}: {
  member: StudentDashboardFacultyMember;
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
        <Card className="h-full overflow-hidden border-border/80 transition-all hover:shadow-sm">
          <div className="relative h-12 overflow-hidden border-b border-border/60 bg-gradient-to-r from-primary/15 via-primary/5 to-muted/40 sm:h-14">
            {member.avatarUrl ? (
              <>
                <img src={member.avatarUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35 blur-[1px]" />
                <div className="absolute inset-0 bg-black/15" />
              </>
            ) : null}
            <div className="absolute left-2 top-2 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-semibold text-primary backdrop-blur-sm">
              Docente
            </div>
          </div>
          <CardHeader className="space-y-0 p-2 pb-1 sm:p-2.5 sm:pb-1.5">
            <div className="flex items-start gap-2.5">
              <Avatar className="h-8 w-8 shrink-0 border border-primary/15 sm:h-9 sm:w-9">
                {member.avatarUrl ? <AvatarImage src={member.avatarUrl} alt="" /> : null}
                <AvatarFallback className="bg-primary/10 font-display text-xs font-bold text-primary sm:text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-0.5">
                <CardTitle className="font-display text-xs font-bold leading-tight sm:text-sm">
                  {normalizePtBrText(member.name)}
                </CardTitle>
                {member.facultyRole ? (
                  <p className="line-clamp-1 text-[9px] text-muted-foreground sm:text-[10px]">{normalizePtBrText(member.facultyRole)}</p>
                ) : null}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 p-2 pt-0 text-sm sm:p-2.5 sm:pt-0">
            {member.headline ? (
              <p className="line-clamp-1 text-[9px] font-medium text-primary sm:text-[10px]">{normalizePtBrText(member.headline)}</p>
            ) : null}
            {member.specialty ? (
              <p className="line-clamp-1 text-[9px] text-muted-foreground sm:text-[10px]">
                <span className="font-semibold text-foreground">Especialidade:</span> {normalizePtBrText(member.specialty)}
              </p>
            ) : null}
            {member.practiceAreas.length > 0 ? (
              <p className="line-clamp-1 text-[9px] text-muted-foreground sm:text-[10px]">
                <span className="font-semibold text-foreground">Atuação:</span> {normalizePtBrText(member.practiceAreas[0])}
              </p>
            ) : null}
            <p className="line-clamp-1 text-[9px] leading-snug text-muted-foreground sm:text-[10px]">
              {normalizePtBrText(member.bioShort)}
            </p>
            <p className="flex items-center gap-0.5 text-[10px] font-medium text-primary sm:text-[11px]">
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
  const nextLessons = mural.nextUp.slice(0, 2);
  const materials = mural.complementary.slice(0, 2);
  const bulletins = mural.bulletins.slice(0, 1);
  const modulesTracked = mural.modulesSummary.length;

  return (
    <Card className="flex h-full max-h-[23rem] flex-col border-primary/15 bg-gradient-to-b from-card to-primary/[0.02] sm:max-h-[24rem]">
      <CardHeader className="space-y-0.5 px-3 py-2.5 sm:px-3.5 sm:py-3">
        <CardTitle className="flex items-center gap-1.5 font-display text-sm font-bold sm:text-base">
          <Target className="h-4 w-4 shrink-0 text-primary sm:h-4 sm:w-4" aria-hidden />
          Mural do curso
        </CardTitle>
        <p className="text-[10px] text-muted-foreground sm:text-xs">«{normalizePtBrText(courseTitle)}»</p>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3 pb-3 pt-0 text-sm sm:px-3.5 sm:pb-3.5">
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

        <div className="grid grid-cols-3 gap-1.5 text-[10px]">
          <div className="rounded border border-border/60 bg-muted/30 px-2 py-1 text-center">
            <p className="font-semibold text-foreground">{nextLessons.length}</p>
            <p className="text-muted-foreground">Próximas</p>
          </div>
          <div className="rounded border border-border/60 bg-muted/30 px-2 py-1 text-center">
            <p className="font-semibold text-foreground">{materials.length}</p>
            <p className="text-muted-foreground">Materiais</p>
          </div>
          <div className="rounded border border-border/60 bg-muted/30 px-2 py-1 text-center">
            <p className="font-semibold text-foreground">{modulesTracked}</p>
            <p className="text-muted-foreground">Módulos</p>
          </div>
        </div>

        <div>
          <p className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
            <LayoutList className="h-3 w-3" aria-hidden />
            Próximas aulas
          </p>
          {nextLessons.length === 0 ? (
            <p className="text-[11px] text-muted-foreground sm:text-xs">Nada além do bloco inicial.</p>
          ) : (
            <ul className="space-y-1 text-[11px] sm:text-xs">
              {nextLessons.map((l) => (
                <li key={l.lessonId}>
                  <Link
                    to={`/student/courses/${courseId}/lessons/${l.lessonId}`}
                    className="flex items-center justify-between gap-1.5 rounded px-1 py-1 hover:bg-muted/80"
                  >
                    <span className="line-clamp-1 font-medium leading-snug">{normalizePtBrText(l.title)}</span>
                    <Badge variant="outline" className="shrink-0 px-1 py-0 text-[9px]">
                      {lessonStatusLabel(l.status)}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {materials.length > 0 ? (
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Materiais</p>
            <ul className="space-y-0.5 text-[11px] sm:text-xs">
              {materials.map((c) => (
                <li key={c.lessonId} className="truncate">
                  <Link to={`/student/courses/${courseId}/lessons/${c.lessonId}`} className="text-primary hover:underline">
                    {normalizePtBrText(c.title)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {bulletins.length > 0 ? (
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Aviso</p>
            <div className="flex gap-1.5 rounded border border-border/40 bg-background/60 px-2 py-1.5 text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
              <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-primary" aria-hidden />
              <span className="line-clamp-2">{normalizePtBrText(bulletins[0])}</span>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

type Props = { home: StudentDashboardSingleCourseHome };

export function SingleCourseHomeExperience({ home }: Props) {
  const facultySlots: (StudentDashboardFacultyMember | null)[] = [...home.faculty];
  const [audioPreferenceEnabled, setAudioPreferenceEnabled] = useState(false);
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
              <FacultyCard key={member.userId} member={member} />
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
            <LessonPreviewCard
              key={lesson.id}
              courseId={home.courseId}
              courseTitle={home.courseTitle}
              courseCover={home.courseCover}
              audioPreferenceEnabled={audioPreferenceEnabled}
              onAudioPreferenceChange={setAudioPreferenceEnabled}
              lesson={lesson}
              visualOnly
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-3">
          {home.lessonFourth ? (
            <LessonPreviewCard
              courseId={home.courseId}
              courseTitle={home.courseTitle}
              courseCover={home.courseCover}
              audioPreferenceEnabled={audioPreferenceEnabled}
              onAudioPreferenceChange={setAudioPreferenceEnabled}
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
