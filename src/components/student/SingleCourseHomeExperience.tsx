import { useEffect, useMemo, useRef, useState, type MouseEventHandler, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type {
  StudentDashboardLessonPreview,
  StudentDashboardSingleCourseHome,
} from '@/types/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import {
  Captions,
  ChevronRight,
  Clock,
  LayoutList,
  PlayCircle,
  Target,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { normalizePtBrText } from '@/lib/normalize-ptbr';
import { resolveApiUrl } from '@/lib/axios';
import { cn } from '@/lib/utils';
import { useVideoPreviewPreload } from '@/hooks/use-video-preview-preload';
import { useStudentProfile } from '@/hooks/use-student';

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
  preloadOrder = 0,
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
  /** Índice do card na lista — usado para escalonar o pré-carregamento e não saturar a rede. */
  preloadOrder?: number;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const youtubeFrameRef = useRef<HTMLIFrameElement | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isSubtitleEnabled, setIsSubtitleEnabled] = useState(false);
  const [hasSubtitleTrack, setHasSubtitleTrack] = useState(false);
  const [isYoutubeReady, setIsYoutubeReady] = useState(false);
  // Quando true, o preview já está aquecido: o iframe do YouTube fica montado
  // (escondido) e o <video> hospedado passa a usar `preload="auto"`. Assim, o
  // hover apenas alterna a visibilidade — sem latência de download.
  const [isPreviewWarmedUp, setIsPreviewWarmedUp] = useState(false);

  const label = `${normalizePtBrText(courseTitle)} — ${normalizePtBrText(lesson.title)} — ${normalizePtBrText(lesson.moduleTitle)}`;
  const ytPoster = lesson.videoUrl ? youtubePosterUrl(lesson.videoUrl) : null;
  const ytVideoId = lesson.videoUrl ? youtubeVideoId(lesson.videoUrl) : null;
  const hostedSrc = lesson.videoPreviewUrl ? resolveApiUrl(lesson.videoPreviewUrl) : null;
  const canPreview = Boolean(hostedSrc || ytVideoId);
  const shouldMountYoutubeIframe = Boolean(!hostedSrc && ytVideoId && (isHovering || isPreviewWarmedUp));
  const hostedPreloadStrategy: 'metadata' | 'auto' = isPreviewWarmedUp ? 'auto' : 'metadata';
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
    if (!shouldMountYoutubeIframe || !isYoutubeReady) return;
    applyYoutubePreferences(isAudioEnabled, isSubtitleEnabled);
    const retry1 = window.setTimeout(() => applyYoutubePreferences(isAudioEnabled, isSubtitleEnabled), 220);
    const retry2 = window.setTimeout(() => applyYoutubePreferences(isAudioEnabled, isSubtitleEnabled), 520);
    return () => {
      window.clearTimeout(retry1);
      window.clearTimeout(retry2);
    };
  }, [isAudioEnabled, isSubtitleEnabled, shouldMountYoutubeIframe, isYoutubeReady]);

  // Quando o iframe é pré-aquecido (montado em background), ele inicia com
  // autoplay+mute. Pausamos imediatamente após o ready para economizar banda
  // e CPU enquanto o usuário não interage. No hover, voltamos a tocar.
  useEffect(() => {
    if (!shouldMountYoutubeIframe || !isYoutubeReady) return;
    sendYoutubeCommand(isHovering ? 'playVideo' : 'pauseVideo');
  }, [isHovering, isYoutubeReady, shouldMountYoutubeIframe]);

  // Agendamento do warm-up: assim que o navegador estiver ocioso (após o
  // Dashboard estabilizar), preparamos o preview em segundo plano.
  useEffect(() => {
    if (!canPreview || isPreviewWarmedUp) return;
    if (typeof window === 'undefined') return;

    let cancelled = false;
    let idleHandle: number | null = null;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    const baseDelay = 350 + preloadOrder * 280;
    const timeoutId = window.setTimeout(() => {
      if (cancelled) return;
      const run = () => {
        if (cancelled) return;
        setIsPreviewWarmedUp(true);
      };
      if (typeof w.requestIdleCallback === 'function') {
        idleHandle = w.requestIdleCallback(run, { timeout: 3000 });
      } else {
        run();
      }
    }, baseDelay);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      if (idleHandle != null && typeof w.cancelIdleCallback === 'function') {
        w.cancelIdleCallback(idleHandle);
      }
    };
  }, [canPreview, preloadOrder, isPreviewWarmedUp]);

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
    if (youtubeFrameRef.current) {
      sendYoutubeCommand('mute');
      sendYoutubeCommand(isPreviewWarmedUp ? 'pauseVideo' : 'stopVideo');
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
    if (shouldMountYoutubeIframe && isYoutubeReady) {
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

  if (visualOnly) {
    const coverSrc = courseCover ? resolveApiUrl(courseCover) : null;
    const subtitleText = lesson.description?.trim()
      ? normalizePtBrText(lesson.description)
      : normalizePtBrText(courseTitle);

    return (
      <Link
        to={`/student/courses/${courseId}/lessons/${lesson.id}`}
        className={cn(
          'group relative flex aspect-[4/5] w-full min-w-0 cursor-pointer overflow-hidden rounded-2xl border border-border/80 bg-card shadow-md sm:aspect-[3/4]',
          'transition-all duration-300 ease-out motion-reduce:transition-none motion-reduce:hover:translate-y-0 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/12 dark:hover:shadow-black/40',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          className,
        )}
        aria-label={label}
      >
        <div
          className="absolute inset-0 cursor-pointer"
          onMouseEnter={canPreview ? handlePreviewStart : undefined}
          onMouseLeave={canPreview ? handlePreviewStop : undefined}
        >
          {ytPoster ? (
            <img
              src={ytPoster}
              alt=""
              loading="lazy"
              className={cn(
                'pointer-events-none absolute inset-0 z-[1] h-full w-full object-cover transition-transform duration-500 ease-out motion-reduce:transition-none motion-reduce:group-hover:scale-100',
                isHovering ? 'scale-[1.02]' : 'group-hover:scale-[1.03]',
              )}
            />
          ) : null}
          {hostedSrc ? (
            <video
              ref={videoRef}
              src={hostedSrc}
              muted
              playsInline
              preload={hostedPreloadStrategy}
              loop
              onLoadedMetadata={handleHostedMetadata}
              className={cn(
                'preview-video pointer-events-none absolute inset-0 z-[1] h-full w-full object-cover transition-transform duration-300 motion-reduce:transition-none',
                isHovering ? 'scale-[1.03]' : 'scale-100 motion-reduce:group-hover:scale-100 group-hover:scale-[1.02]',
              )}
              aria-hidden
            />
          ) : null}
          {!ytPoster && !hostedSrc && coverSrc ? (
            <img
              src={coverSrc}
              alt=""
              loading="lazy"
              className={cn(
                'pointer-events-none absolute inset-0 z-[1] h-full w-full object-cover transition-transform duration-500 motion-reduce:transition-none motion-reduce:group-hover:scale-100',
                isHovering ? 'scale-[1.02]' : 'group-hover:scale-105',
              )}
            />
          ) : null}
          {!ytPoster && !hostedSrc && !coverSrc ? (
            <div
              className="absolute inset-0 z-[1] bg-gradient-to-br from-muted via-muted/80 to-background"
              aria-hidden
            />
          ) : null}
          {shouldMountYoutubeIframe && youtubePreviewSrc ? (
            <iframe
              ref={youtubeFrameRef}
              src={youtubePreviewSrc}
              title={`Prévia da aula ${normalizePtBrText(lesson.title)}`}
              allow="autoplay; encrypted-media; picture-in-picture"
              className={cn(
                'pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-200',
                isHovering ? 'z-[3] opacity-100' : 'z-[0] opacity-0',
              )}
              onLoad={handleYoutubeLoaded}
              tabIndex={-1}
              aria-hidden
            />
          ) : null}

          <div
            className={cn(
              'pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/75 via-black/20 to-transparent transition-opacity duration-300 motion-reduce:transition-none',
              isHovering ? 'opacity-100' : 'opacity-90 group-hover:opacity-100',
            )}
            aria-hidden
          />

          {isHovering && canPreview ? (
            <div className="pointer-events-auto absolute right-2 top-2 z-[8] flex flex-col gap-1.5">
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
        </div>

        <div className="pointer-events-none relative z-[6] mt-auto flex flex-col gap-1 p-3 sm:p-4">
          <span className="inline-flex w-fit max-w-full truncate rounded-full bg-background/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground/90 backdrop-blur-sm sm:text-[11px]">
            {normalizePtBrText(lesson.moduleTitle)}
          </span>
          <h3 className="line-clamp-2 font-display text-sm font-bold leading-tight text-white drop-shadow-sm sm:text-base">
            {normalizePtBrText(lesson.title).toLocaleUpperCase('pt-BR')}
          </h3>
          <p className="line-clamp-2 text-[11px] leading-relaxed text-white/90 drop-shadow-sm sm:text-xs">{subtitleText}</p>
          <div className="flex flex-wrap gap-1 pt-0.5">
            <span className="inline-flex rounded-full border border-white/30 bg-black/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/95 backdrop-blur-sm sm:text-[11px]">
              {lesson.type}
            </span>
            {lesson.isCompleted ? (
              <span className="inline-flex rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-semibold text-white sm:text-[11px]">
                Assistida
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    );
  }

  const playerArea = (
    <div
      className="relative h-[5.5rem] w-full shrink-0 overflow-hidden bg-gradient-to-br from-primary/25 via-primary/10 to-muted sm:h-[6.5rem]"
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
          preload={hostedPreloadStrategy}
          loop
          onLoadedMetadata={handleHostedMetadata}
          className={cn(
            'preview-video pointer-events-none absolute inset-0 z-[1] h-full w-full object-cover transition-transform duration-300',
            isHovering ? 'scale-[1.03]' : 'scale-100',
          )}
          aria-hidden
        />
      ) : null}
      {shouldMountYoutubeIframe && youtubePreviewSrc ? (
        <iframe
          ref={youtubeFrameRef}
          src={youtubePreviewSrc}
          title={`Prévia da aula ${normalizePtBrText(lesson.title)}`}
          allow="autoplay; encrypted-media; picture-in-picture"
          className={cn(
            'pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-200',
            isHovering ? 'z-[3] opacity-100' : 'z-[0] opacity-0',
          )}
          onLoad={handleYoutubeLoaded}
          tabIndex={-1}
          aria-hidden
        />
      ) : null}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/55 via-black/10 to-transparent transition-opacity duration-300',
          isHovering ? 'opacity-100' : 'opacity-90 group-hover:opacity-100',
        )}
        aria-hidden
      />
      <div className="absolute inset-0 z-[3] flex items-center justify-center">
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/90 text-primary shadow-xl shadow-black/30 ring-1 ring-black/10 transition-all sm:h-12 sm:w-12',
            isHovering ? 'scale-110 opacity-0' : 'scale-100 opacity-100',
          )}
        >
          <PlayCircle className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
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
      <Badge
        variant="secondary"
        className="absolute left-1.5 top-1.5 z-[4] bg-background/90 px-1.5 py-0 text-[10px] font-semibold backdrop-blur-sm sm:left-2 sm:top-2 sm:text-[11px]"
      >
        {lessonStatusLabel(lesson.status)}
      </Badge>
    </div>
  );

  return (
    <Link
      to={`/student/courses/${courseId}/lessons/${lesson.id}`}
      className={cn('group block min-w-0 cursor-pointer', className)}
      aria-label={label}
    >
      <Card className="flex h-full flex-col overflow-hidden border-border/80 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10">
        {playerArea}
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
      </Card>
    </Link>
  );
}

type Props = { home: StudentDashboardSingleCourseHome };

function DashboardInfoCard({
  icon,
  iconWrapClass,
  children,
  footer,
  href,
}: {
  icon: ReactNode;
  iconWrapClass: string;
  children: ReactNode;
  footer?: ReactNode;
  href?: string;
}) {
  const card = (
    <Card className="h-full border-border/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none">
      <CardContent className="flex h-[7.75rem] items-center gap-3 overflow-hidden p-3 sm:h-[8rem] sm:p-4">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-full',
            iconWrapClass,
          )}
        >
          {icon}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
          {children}
          {footer ? <div className="mt-1">{footer}</div> : null}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link to={href} className="group block h-full min-w-0">
        {card}
      </Link>
    );
  }

  return card;
}

export function SingleCourseHomeExperience({ home }: Props) {
  const [audioPreferenceEnabled, setAudioPreferenceEnabled] = useState(false);
  const { data: profile } = useStudentProfile();

  const featuredLessons: StudentDashboardLessonPreview[] = [
    ...home.lessonRowTop,
    ...(home.lessonFourth ? [home.lessonFourth] : []),
  ];
  const fourthLessonPlaceholder = home.lessonRowTop.length === 3 && !home.lessonFourth;

  const preloadEntries = useMemo(
    () =>
      featuredLessons.map((lesson) => ({
        hostedUrl: lesson.videoPreviewUrl ?? null,
        youtubeId: lesson.videoUrl ? youtubeVideoId(lesson.videoUrl) : null,
      })),
    [featuredLessons],
  );
  useVideoPreviewPreload(preloadEntries);

  const lessonsCarouselOptions = useMemo(
    () => ({ align: 'start' as const, dragFree: true, containScroll: 'trimSnaps' as const }),
    [],
  );

  const firstName = profile?.name.trim().split(/\s+/)[0] ?? null;
  const { completedLessons, totalPublishedLessons } = home.mural.stats;
  const progressRounded = Math.round(home.mural.progressPercent);
  const remainingLessons = Math.max(0, totalPublishedLessons - completedLessons);
  const isCourseCompleted = totalPublishedLessons > 0 && completedLessons >= totalPublishedLessons;
  const nextLesson = home.mural.recommended;
  const totalModules = home.mural.modulesSummary.length;

  return (
    <div className="w-full min-w-0 space-y-4 sm:space-y-5">
      {/* Banner de boas-vindas */}
      <div className="relative overflow-hidden rounded-xl border border-border/80 bg-gradient-to-br from-card via-gc-ice/90 to-primary/[0.06] shadow-sm dark:from-card dark:via-muted/80 dark:to-primary/10">
        <div
          className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl dark:bg-primary/5"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 right-1/4 h-24 w-24 rounded-full bg-gc-teal/15 blur-2xl dark:bg-gc-teal/8"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-8 top-6 h-3 w-3 rounded-full bg-gc-coral/40 dark:bg-gc-coral/25"
          aria-hidden
        />

        <div className="relative flex flex-col sm:flex-row sm:items-stretch">
          <div className="flex flex-1 flex-col justify-center border-b border-border/40 px-5 py-5 sm:border-b-0 sm:border-r sm:px-7 sm:py-6">
            <h1 className="font-display text-xl font-bold leading-tight sm:text-2xl md:text-3xl">
              <span className="text-gc-text dark:text-foreground">Olá, </span>
              <span className="bg-gradient-to-r from-primary via-primary to-gc-teal bg-clip-text text-transparent">
                {firstName ? normalizePtBrText(firstName) : 'visitante'}
              </span>
              <span className="text-gc-text dark:text-foreground">! </span>
              <span aria-hidden>👋</span>
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-gc-gray-text dark:text-muted-foreground sm:text-[15px]">
              Continue sua jornada de aprendizado e{' '}
              <span className="font-medium text-gc-text/90 dark:text-foreground/90">evolua constantemente</span>. Cada aula concluída é um
              passo a mais no avanço da sua carreira.
            </p>
          </div>
          <div className="relative flex min-h-36 shrink-0 self-stretch overflow-hidden bg-gradient-to-br from-primary/[0.04] to-gc-teal/[0.06] sm:min-h-0 sm:w-44 md:w-52 lg:w-60">
            <img
              src="/boas-vindas.jpg"
              alt=""
              className="h-full min-h-0 w-full object-cover object-center"
            />
          </div>
        </div>
      </div>

      {/* 4 cards informativos */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 [&>*]:h-full [&>*]:min-w-0">
        <DashboardInfoCard
          icon={<Target className="h-5 w-5 text-orange-500" aria-hidden />}
          iconWrapClass="bg-orange-100 dark:bg-orange-500/15"
          footer={
            <p className="text-[10px] leading-snug text-muted-foreground">
              {completedLessons} de {totalPublishedLessons} aula{totalPublishedLessons !== 1 ? 's' : ''} concluída
              {completedLessons !== 1 ? 's' : ''}
            </p>
          }
        >
          <p className="text-xl font-bold tabular-nums leading-none text-foreground sm:text-2xl">{progressRounded}%</p>
          <p className="text-xs font-medium text-muted-foreground">Meu Progresso</p>
          <Progress value={home.mural.progressPercent} className="mt-1.5 h-1" />
        </DashboardInfoCard>

        <DashboardInfoCard
          icon={<PlayCircle className="h-5 w-5 text-teal-500" aria-hidden />}
          iconWrapClass="bg-teal-100 dark:bg-teal-500/15"
          href={nextLesson && !isCourseCompleted ? `/student/courses/${home.courseId}/lessons/${nextLesson.lessonId}` : undefined}
          footer={
            nextLesson && !isCourseCompleted ? (
              <p className="text-[10px] font-medium text-primary group-hover:underline">Continuar →</p>
            ) : undefined
          }
        >
          <p className="line-clamp-2 text-base font-bold leading-snug text-foreground sm:text-lg">
            {nextLesson && !isCourseCompleted
              ? normalizePtBrText(nextLesson.title)
              : totalPublishedLessons === 0
                ? 'Nenhuma aula publicada'
                : 'Curso concluído! 🎉'}
          </p>
          <p className="text-xs font-medium text-muted-foreground">Próxima Aula</p>
        </DashboardInfoCard>

        <DashboardInfoCard
          icon={<LayoutList className="h-5 w-5 text-yellow-500" aria-hidden />}
          iconWrapClass="bg-yellow-100 dark:bg-yellow-500/15"
          footer={
            <p className="text-[10px] leading-snug text-muted-foreground">
              {totalModules > 0
                ? `${totalModules} ${totalModules === 1 ? 'módulo' : 'módulos'} no curso`
                : 'Nenhum módulo cadastrado'}
            </p>
          }
        >
          <p className="text-xl font-bold tabular-nums leading-none text-foreground sm:text-2xl">{remainingLessons}</p>
          <p className="text-xs font-medium text-muted-foreground">Aulas Restantes</p>
        </DashboardInfoCard>

        <DashboardInfoCard
          icon={<Clock className="h-5 w-5 text-slate-500 dark:text-slate-400" aria-hidden />}
          iconWrapClass="bg-slate-100 dark:bg-slate-500/15"
          footer={<p className="text-[10px] leading-snug text-muted-foreground">De conteúdo completo</p>}
        >
          <p className="text-xl font-bold tabular-nums leading-none text-foreground sm:text-2xl">
            {home.workloadHours != null && home.workloadHours > 0 ? `${home.workloadHours}h` : '—'}
          </p>
          <p className="text-xs font-medium text-muted-foreground">Carga Horária Total</p>
        </DashboardInfoCard>
      </div>

      {/* Seção de aulas em destaque */}
      <section aria-labelledby="lessons-heading" className="space-y-2 sm:space-y-2.5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="lessons-heading" className="min-w-0 break-words font-display text-base font-bold sm:text-lg">
            <span className="text-gc-coral">Início do módulo</span>
            {" "}
            <span className="text-foreground">— aulas em destaque</span>
          </h2>
          <Link
            to={`/student/courses/${home.courseId}/lessons/start`}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-primary hover:underline"
          >
            Ver todas as aulas
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {featuredLessons.length > 0 ? (
          <Carousel opts={lessonsCarouselOptions} className="w-full">
            <CarouselContent className="-ml-3 sm:-ml-4">
              {featuredLessons.map((lesson, idx) => (
                <CarouselItem
                  key={lesson.id}
                  className="basis-[78%] pl-3 min-[420px]:basis-[58%] sm:basis-1/2 sm:pl-4 lg:basis-1/4"
                >
                  <LessonPreviewCard
                    courseId={home.courseId}
                    courseTitle={home.courseTitle}
                    courseCover={home.courseCover}
                    audioPreferenceEnabled={audioPreferenceEnabled}
                    onAudioPreferenceChange={setAudioPreferenceEnabled}
                    lesson={lesson}
                    preloadOrder={idx}
                    visualOnly
                  />
                </CarouselItem>
              ))}
              {fourthLessonPlaceholder ? (
                <CarouselItem
                  key="lesson-placeholder"
                  className="basis-[78%] pl-3 min-[420px]:basis-[58%] sm:basis-1/2 sm:pl-4 lg:basis-1/4"
                >
                  <Card className="flex aspect-[4/5] min-h-0 min-w-0 flex-col items-center justify-center border-dashed border-muted-foreground/25 bg-muted/10 px-3 text-center text-xs text-muted-foreground sm:aspect-[3/4] sm:text-sm">
                    <p>Sem quarta aula publicada neste módulo.</p>
                  </Card>
                </CarouselItem>
              ) : null}
            </CarouselContent>
          </Carousel>
        ) : (
          <p className="rounded-lg border border-dashed border-muted-foreground/25 bg-muted/10 px-4 py-6 text-center text-sm text-muted-foreground">
            Nenhuma aula publicada neste módulo ainda.
          </p>
        )}
      </section>
    </div>
  );
}
