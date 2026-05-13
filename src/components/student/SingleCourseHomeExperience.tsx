import { useEffect, useMemo, useRef, useState, type MouseEventHandler, type ReactNode } from 'react';
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
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
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
  Layers,
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
import { useVideoPreviewPreload } from '@/hooks/use-video-preview-preload';

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

/**
 * Classes para o badge de status conforme estado da aula. Mantém o verde
 * suave para "Disponível" (distinto do verde escuro de "Assistida").
 */
function lessonStatusBadgeClass(status: StudentDashboardLessonPreview['status']): string {
  if (status === 'AVAILABLE') {
    return 'border-transparent bg-green-600 text-white hover:bg-green-600';
  }
  if (status === 'COMPLETED') {
    return 'border-transparent bg-green-700 text-white hover:bg-green-700';
  }
  return '';
}

/**
 * Renderiza um texto de aviso destacando trechos entre «...» (ex.: nome do
 * curso) em negrito. Os marcadores de aspas latinas são removidos do output.
 */
function renderBulletinText(text: string): ReactNode {
  const regex = /«([^»]+)»/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    nodes.push(
      <strong key={key++} className="font-bold text-foreground">
        {match[1]}
      </strong>,
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes.length > 0 ? nodes : text;
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
  // Dashboard estabilizar), preparamos o preview em segundo plano. Para
  // YouTube, montamos o iframe escondido; para vídeos hospedados, trocamos
  // `preload` para `"auto"`. Em ambos os casos, o primeiro hover passa a ser
  // instantâneo. O delay é escalonado por `preloadOrder` para evitar uma
  // rajada simultânea de downloads.
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
      // Quando o iframe está pré-aquecido, apenas pausamos (mantemos o player
      // pronto). Sem warm-up, o iframe vai desmontar de qualquer forma.
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
                // Sempre sem captura de ponteiro: o clique deve ir para o <Link> (abrir aula).
                'pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-200',
                isHovering ? 'z-[3] opacity-100' : 'z-[0] opacity-0',
              )}
              onLoad={handleYoutubeLoaded}
              tabIndex={-1}
              aria-hidden
            />
          ) : null}

          {/* Vinheta só na base para legibilidade do texto — sem tom azul/ciano sobre o vídeo */}
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
            // Sempre sem captura de ponteiro: o clique deve ir para o <Link> (abrir aula).
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
        className="group h-full w-full text-left outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Card className="h-full overflow-hidden border-border/80 shadow-sm transition-all duration-200 ease-out motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-hover:shadow-sm group-hover:-translate-y-0.5 group-hover:border-primary/15 group-hover:shadow-md group-hover:shadow-black/5 dark:group-hover:shadow-black/20">
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
              <Avatar className="h-9 w-9 min-h-9 min-w-9 shrink-0 border-2 border-neutral-800/85 shadow-sm transition-transform duration-200 ease-out group-hover:scale-[1.02] motion-reduce:group-hover:scale-100 dark:border-neutral-950 sm:h-10 sm:w-10 sm:min-h-10 sm:min-w-10">
                {member.avatarUrl ? (
                  <AvatarImage
                    src={member.avatarUrl}
                    alt=""
                    className="origin-center scale-[1.06] object-cover object-[center_28%]"
                  />
                ) : null}
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
                  <Avatar className="h-24 w-24 min-h-24 min-w-24 shrink-0 border-2 border-neutral-800/85 shadow-md dark:border-neutral-950 sm:h-28 sm:w-28 sm:min-h-28 sm:min-w-28">
                    {member.avatarUrl ? (
                      <AvatarImage
                        src={member.avatarUrl}
                        alt=""
                        className="origin-center scale-[1.08] object-cover object-[center_25%]"
                      />
                    ) : null}
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

function CourseProgressCard({ mural }: { mural: StudentDashboardMural }) {
  const progressRounded = Math.round(mural.progressPercent);
  const comingSoon = mural.stats.comingSoonLessons;
  const comingSoonPhrase =
    comingSoon > 0
      ? comingSoon === 1
        ? ' · 1 aula em breve'
        : ` · ${comingSoon} aulas em breve`
      : '';

  return (
    <Card
      role="region"
      aria-labelledby="mural-progress-title"
      className="flex h-full min-w-0 flex-col overflow-hidden border border-border/50 bg-muted/60 shadow-none dark:bg-muted/30"
    >
      <CardHeader className="space-y-0 border-b border-border/40 px-3 py-3 sm:px-4 sm:py-3.5">
        <div className="flex items-start gap-2.5 sm:gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Target className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1 space-y-0.5">
            <CardTitle
              id="mural-progress-title"
              className="font-display text-sm font-bold leading-tight sm:text-base"
            >
              Progresso do curso
            </CardTitle>
            <p className="text-[11px] leading-snug text-muted-foreground sm:text-xs">
              Acompanhe sua evolução nas aulas publicadas.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 px-3 pb-4 pt-3 text-sm sm:px-4 sm:pb-4 sm:pt-3.5">
        <div
          className="rounded-lg border border-border/60 bg-background/80 px-3 py-2.5 dark:bg-background/40"
          aria-label={`Progresso no curso: ${progressRounded} por cento. ${mural.stats.completedLessons} de ${mural.stats.totalPublishedLessons} aulas publicadas concluídas.`}
        >
          <div className="mb-1.5 flex items-baseline justify-between gap-2">
            <span className="text-xs font-semibold text-foreground">Seu progresso</span>
            <span className="tabular-nums text-xs font-bold text-primary">{progressRounded}%</span>
          </div>
          <Progress value={mural.progressPercent} className="h-2" />
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
            <span className="font-medium text-foreground">{mural.stats.completedLessons}</span>
            {' de '}
            <span className="font-medium text-foreground">{mural.stats.totalPublishedLessons}</span>
            {' aulas publicadas concluídas'}
            {comingSoonPhrase}
          </p>
        </div>

        <div
          className="grid grid-cols-3 gap-2"
          role="group"
          aria-label="Resumo rápido: aulas na fila, materiais complementares e módulos acompanhados."
        >
          <div className="flex flex-col items-center gap-1 rounded-lg border border-border/60 bg-background/80 px-1.5 py-2.5 text-center dark:bg-background/40 sm:px-2 sm:py-3">
            <LayoutList className="h-3.5 w-3.5 text-primary/80" aria-hidden />
            <p className="text-lg font-bold tabular-nums leading-none text-foreground sm:text-xl">{mural.nextUp.length}</p>
            <p className="text-[10px] font-medium leading-tight text-muted-foreground sm:text-[11px]">Na fila</p>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg border border-border/60 bg-background/80 px-1.5 py-2.5 text-center dark:bg-background/40 sm:px-2 sm:py-3">
            <BookMarked className="h-3.5 w-3.5 text-primary/80" aria-hidden />
            <p className="text-lg font-bold tabular-nums leading-none text-foreground sm:text-xl">{mural.complementary.length}</p>
            <p className="line-clamp-2 text-[10px] font-medium leading-tight text-muted-foreground sm:text-[11px]">
              Materiais extras
            </p>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg border border-border/60 bg-background/80 px-1.5 py-2.5 text-center dark:bg-background/40 sm:px-2 sm:py-3">
            <Layers className="h-3.5 w-3.5 text-primary/80" aria-hidden />
            <p className="text-lg font-bold tabular-nums leading-none text-foreground sm:text-xl">{mural.modulesSummary.length}</p>
            <p className="text-[10px] font-medium leading-tight text-muted-foreground sm:text-[11px]">Módulos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecommendedLessonCard({
  courseId,
  mural,
}: {
  courseId: string;
  mural: StudentDashboardMural;
}) {
  const recommended = mural.recommended;

  return (
    <Card
      role="region"
      aria-labelledby="mural-recommended-title"
      className="flex h-full min-w-0 flex-col overflow-hidden border border-border/50 bg-muted/60 shadow-none dark:bg-muted/30"
    >
      <CardHeader className="space-y-0 border-b border-border/40 px-3 py-3 sm:px-4 sm:py-3.5">
        <div className="flex items-start gap-2.5 sm:gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1 space-y-0.5">
            <CardTitle
              id="mural-recommended-title"
              className="font-display text-sm font-bold leading-tight sm:text-base"
            >
              Aula recomendada
            </CardTitle>
            <p className="text-[11px] leading-snug text-muted-foreground sm:text-xs">
              Continue de onde paramos sua jornada.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 px-3 pb-4 pt-3 text-sm sm:px-4 sm:pb-4 sm:pt-3.5">
        {recommended ? (
          <div className="flex flex-1 flex-col rounded-lg border border-primary/25 bg-primary/[0.06] p-2.5 shadow-sm sm:p-3">
            <Link
              to={`/student/courses/${courseId}/lessons/${recommended.lessonId}`}
              className="group flex items-start justify-between gap-2 text-sm font-semibold leading-snug text-foreground transition-colors hover:text-primary"
            >
              <span className="line-clamp-3 min-w-0">{normalizePtBrText(recommended.title)}</span>
              <ChevronRight
                className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden
              />
            </Link>
            <p className="mt-2 text-[11px] text-muted-foreground sm:text-xs">
              <span className="font-medium text-foreground/80">Módulo:</span>{' '}
              {normalizePtBrText(recommended.moduleTitle)}
            </p>
            <div className="mt-auto pt-3">
              <Link
                to={`/student/courses/${courseId}/lessons/${recommended.lessonId}`}
                className={cn(buttonVariants({ size: 'sm' }), 'w-full gap-1.5')}
              >
                <PlayCircle className="h-4 w-4" aria-hidden />
                Continuar aula
              </Link>
            </div>
          </div>
        ) : (
          <p className="flex flex-1 items-center justify-center rounded-md border border-dashed border-muted-foreground/25 bg-background/70 px-2.5 py-4 text-center text-[11px] leading-relaxed text-muted-foreground dark:bg-background/30 sm:text-xs">
            Nenhuma recomendação personalizada no momento. Conforme você avança, sugeriremos a próxima aula aqui.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function CourseMuralExtrasCard({
  courseId,
  mural,
}: {
  courseId: string;
  mural: StudentDashboardMural;
}) {
  const nextLessons = mural.nextUp.slice(0, 3);
  const materials = mural.complementary.slice(0, 3);
  const bulletins = mural.bulletins.slice(0, 1);

  return (
    <Card
      role="region"
      aria-labelledby="mural-extras-title"
      className="flex min-w-0 flex-col overflow-hidden border border-border/50 bg-muted/60 shadow-none dark:bg-muted/30"
    >
      <CardHeader className="space-y-0 border-b border-border/40 px-3 py-3 sm:px-4 sm:py-3.5">
        <div className="flex items-start gap-2.5 sm:gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LayoutList className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1 space-y-0.5">
            <CardTitle
              id="mural-extras-title"
              className="font-display text-sm font-bold leading-tight sm:text-base"
            >
              Próximos passos e materiais
            </CardTitle>
            <p className="text-[11px] leading-snug text-muted-foreground sm:text-xs">
              Aulas na fila, materiais complementares e avisos do curso.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-3 pb-4 pt-3 text-sm sm:grid sm:grid-cols-3 sm:gap-4 sm:px-4 sm:pb-4 sm:pt-3.5">
        <section aria-labelledby="mural-next-heading" className="min-w-0 space-y-1.5">
          <h4
            id="mural-next-heading"
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground"
          >
            <LayoutList className="h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden />
            Próximas na sua fila
          </h4>
          {nextLessons.length === 0 ? (
            <p className="rounded-md border border-dashed border-muted-foreground/25 bg-background/70 px-2.5 py-2 text-[11px] leading-relaxed text-muted-foreground dark:bg-background/30 sm:text-xs">
              Nenhuma outra aula aparece na fila neste momento.
            </p>
          ) : (
            <ul className="space-y-1 text-[11px] sm:text-xs">
              {nextLessons.map((l) => (
                <li key={l.lessonId}>
                  <Link
                    to={`/student/courses/${courseId}/lessons/${l.lessonId}`}
                    className="flex items-center justify-between gap-2 rounded-md border border-transparent px-2 py-1.5 transition-colors hover:border-border/80 hover:bg-background/80 dark:hover:bg-background/40"
                  >
                    <span className="line-clamp-1 min-w-0 font-medium leading-snug">{normalizePtBrText(l.title)}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        'shrink-0 px-1.5 py-0 text-[9px] font-semibold',
                        lessonStatusBadgeClass(l.status),
                      )}
                    >
                      {lessonStatusLabel(l.status)}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="mural-materials-heading" className="min-w-0 space-y-1.5">
          <h4
            id="mural-materials-heading"
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground"
          >
            <BookMarked className="h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden />
            Materiais complementares
          </h4>
          {materials.length === 0 ? (
            <p className="rounded-md border border-dashed border-muted-foreground/25 bg-background/70 px-2.5 py-2 text-[11px] leading-relaxed text-muted-foreground dark:bg-background/30 sm:text-xs">
              Sem materiais complementares listados.
            </p>
          ) : (
            <ul className="space-y-1 rounded-md border border-border/50 bg-background/70 p-1.5 text-[11px] dark:bg-background/30 sm:text-xs">
              {materials.map((c) => (
                <li key={c.lessonId} className="min-w-0">
                  <Link
                    to={`/student/courses/${courseId}/lessons/${c.lessonId}`}
                    className="flex items-center gap-1.5 rounded px-1.5 py-1 font-medium text-primary underline-offset-2 hover:bg-background/80 hover:underline"
                  >
                    <span className="truncate">{normalizePtBrText(c.title)}</span>
                    {c.type ? (
                      <Badge variant="secondary" className="shrink-0 px-1 py-0 text-[9px] font-normal">
                        {c.type}
                      </Badge>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="mural-bulletin-heading" className="min-w-0 space-y-1.5">
          <h4
            id="mural-bulletin-heading"
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground"
          >
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden />
            Avisos do curso
          </h4>
          {bulletins.length > 0 ? (
            <div className="flex gap-2 rounded-lg border border-border/60 bg-background/70 px-2.5 py-2 text-[11px] leading-relaxed text-muted-foreground shadow-sm sm:text-xs">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
              <p className="line-clamp-3 min-w-0">{renderBulletinText(normalizePtBrText(bulletins[0]))}</p>
            </div>
          ) : (
            <p className="rounded-md border border-dashed border-muted-foreground/25 bg-background/70 px-2.5 py-2 text-[11px] leading-relaxed text-muted-foreground dark:bg-background/30 sm:text-xs">
              Sem avisos publicados no momento.
            </p>
          )}
        </section>
      </CardContent>
    </Card>
  );
}

type Props = { home: StudentDashboardSingleCourseHome };

export function SingleCourseHomeExperience({ home }: Props) {
  const facultySlots: (StudentDashboardFacultyMember | null)[] = [...home.faculty];
  const [audioPreferenceEnabled, setAudioPreferenceEnabled] = useState(false);
  while (facultySlots.length < 4) facultySlots.push(null);

  const featuredLessons: StudentDashboardLessonPreview[] = [
    ...home.lessonRowTop,
    ...(home.lessonFourth ? [home.lessonFourth] : []),
  ];
  const fourthLessonPlaceholder = home.lessonRowTop.length === 3 && !home.lessonFourth;

  // Camada leve de pré-carregamento (preconnect YouTube + posters + hint de
  // vídeos hospedados). Roda em background assim que o Dashboard recebe os
  // dados — independente de hover.
  const preloadEntries = useMemo(
    () =>
      featuredLessons.map((lesson) => ({
        hostedUrl: lesson.videoPreviewUrl ?? null,
        youtubeId: lesson.videoUrl ? youtubeVideoId(lesson.videoUrl) : null,
      })),
    [featuredLessons],
  );
  useVideoPreviewPreload(preloadEntries);

  const facultyVisible = facultySlots.slice(0, 4);
  // Embla é mais leve quando há slides suficientes para rolar. Em desktop, o
  // grid mostra tudo de uma vez, então o carrossel se torna inerte.
  const facultyCarouselOptions = useMemo(
    () => ({ align: 'start' as const, dragFree: true, containScroll: 'trimSnaps' as const }),
    [],
  );
  const lessonsCarouselOptions = useMemo(
    () => ({ align: 'start' as const, dragFree: true, containScroll: 'trimSnaps' as const }),
    [],
  );

  return (
    <div className="w-full min-w-0 space-y-4 sm:space-y-5">
      <section aria-labelledby="faculty-heading" className="space-y-2 sm:space-y-2.5">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <h2 id="faculty-heading" className="font-display text-base font-bold text-foreground sm:text-lg">
            Corpo docente
          </h2>
          <p className="max-w-2xl text-[11px] leading-snug text-muted-foreground sm:text-xs">
            Toque para ver formação, certificações e aulas ligadas a cada professor.
          </p>
        </div>

        {/* Mobile: carrossel horizontal para evitar excesso de conteúdo vertical. */}
        <div className="sm:hidden">
          <Carousel opts={facultyCarouselOptions} className="w-full">
            <CarouselContent className="-ml-3">
              {facultyVisible.map((member, idx) => (
                <CarouselItem
                  key={member ? member.userId : `ph-${idx}`}
                  className="basis-[82%] pl-3 min-[420px]:basis-[60%]"
                >
                  {member ? <FacultyCard member={member} /> : <PlaceholderFacultyCard index={idx} />}
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Desktop/tablet: grade tradicional, mantendo o padrão visual existente. */}
        <div className="hidden grid-cols-2 gap-2.5 sm:grid sm:gap-3 lg:grid-cols-4">
          {facultyVisible.map((member, idx) =>
            member ? (
              <FacultyCard key={member.userId} member={member} />
            ) : (
              <PlaceholderFacultyCard key={`ph-${idx}`} index={idx} />
            ),
          )}
        </div>
      </section>

      <section aria-labelledby="lessons-heading" className="space-y-2 sm:space-y-2.5">
        <h2 id="lessons-heading" className="min-w-0 break-words font-display text-base font-bold sm:text-lg">
          Início do módulo — aulas em destaque
        </h2>

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

        <Card
          role="region"
          aria-labelledby="mural-section-heading"
          className="mt-4 flex min-w-0 flex-col overflow-hidden border border-primary/15 bg-gradient-to-b from-card via-card to-primary/[0.035] shadow-sm sm:mt-5"
        >
          <CardHeader className="space-y-0 border-b border-border/50 bg-muted/20 px-4 py-3.5 sm:px-5 sm:py-4">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
                <LayoutList className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1 space-y-0.5">
                <CardTitle
                  id="mural-section-heading"
                  className="font-display text-base font-bold leading-tight sm:text-lg"
                >
                  Mural do curso
                </CardTitle>
                <p className="text-[11px] leading-snug text-muted-foreground sm:text-xs">
                  <span className="sr-only">Curso: </span>
                  <strong className="font-semibold text-foreground">
                    {normalizePtBrText(home.courseTitle)}
                  </strong>
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 px-4 pb-4 pt-4 sm:space-y-4 sm:px-5 sm:pb-5 sm:pt-4">
            {/* Mobile: cards empilhados. Desktop: progresso à esquerda, recomendada à direita. */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 md:items-stretch">
              <CourseProgressCard mural={home.mural} />
              <RecommendedLessonCard courseId={home.courseId} mural={home.mural} />
            </div>

            <CourseMuralExtrasCard courseId={home.courseId} mural={home.mural} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
