import React, { useEffect, useMemo, useRef, useState, type MouseEventHandler, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useInViewportWarmup } from '@/hooks/use-video-preview-preload';
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
  FileText,
  LayoutList,
  PlayCircle,
  Target,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { normalizePtBrText } from '@/lib/normalize-ptbr';
import { COURSE_MATERIALS_DRIVE_URL } from '@/lib/course-materials-config';
import { cn } from '@/lib/utils';
import { useStudentProfile } from '@/hooks/use-student';
import { useLessonVideo } from '@/hooks/use-lesson-video';

const VIMEO_PLAYER_ORIGIN = 'https://player.vimeo.com';

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

function youtubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

/** Embed do card: sem autoplay mostra o frame/poster; no hover a API dá play. */
function buildVimeoPreviewSrc(embedUrl: string | null | undefined, videoId: string): string {
  try {
    const url = new URL(embedUrl?.trim() || `${VIMEO_PLAYER_ORIGIN}/video/${videoId}`);
    url.searchParams.set('autoplay', '0');
    url.searchParams.set('muted', '1');
    url.searchParams.set('loop', '1');
    url.searchParams.set('controls', '0');
    url.searchParams.set('title', '0');
    url.searchParams.set('byline', '0');
    url.searchParams.set('portrait', '0');
    url.searchParams.set('playsinline', '1');
    url.searchParams.set('dnt', '1');
    url.searchParams.set('api', '1');
    return url.toString();
  } catch {
    return `${VIMEO_PLAYER_ORIGIN}/video/${videoId}?autoplay=0&muted=1&loop=1&controls=0&title=0&byline=0&portrait=0&playsinline=1&api=1`;
  }
}

function sendVimeoCommand(iframe: HTMLIFrameElement | null, method: string, value?: unknown) {
  if (!iframe?.contentWindow) return;
  const payload = value === undefined ? { method } : { method, value };
  iframe.contentWindow.postMessage(JSON.stringify(payload), VIMEO_PLAYER_ORIGIN);
}

function lessonStatusLabel(status: StudentDashboardLessonPreview['status']): string {
  if (status === 'COMPLETED') return 'Concluída';
  if (status === 'COMING_SOON') return 'Em breve';
  return 'Disponível';
}

function LessonPreviewCard({
  courseId,
  courseTitle,
  audioPreferenceEnabled,
  onAudioPreferenceChange,
  lesson,
  className,
  visualOnly = false,
  preloadOrder = 0,
}: {
  courseId: string;
  courseTitle: string;
  audioPreferenceEnabled: boolean;
  onAudioPreferenceChange: (enabled: boolean) => void;
  lesson: StudentDashboardLessonPreview;
  className?: string;
  /** Preview compacto (player + informações úteis abaixo). */
  visualOnly?: boolean;
  /** Posição do card no carrossel — escalone o delay do warm-up para evitar
   *  N requests simultâneos ao entrar na página. */
  preloadOrder?: number;
}) {
  const containerRef = useRef<HTMLElement | null>(null);
  const youtubeFrameRef = useRef<HTMLIFrameElement | null>(null);
  const vimeoFrameRef = useRef<HTMLIFrameElement | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isSubtitleEnabled, setIsSubtitleEnabled] = useState(false);
  const [isYoutubeReady, setIsYoutubeReady] = useState(false);
  const [isVimeoReady, setIsVimeoReady] = useState(false);
  const [isPreviewWarmedUp, setIsPreviewWarmedUp] = useState(false);

  const label = `${normalizePtBrText(courseTitle)} — ${normalizePtBrText(lesson.title)} — ${normalizePtBrText(lesson.moduleTitle)}`;
  const ytVideoId = !lesson.hasVimeoVideo && lesson.videoUrl ? youtubeVideoId(lesson.videoUrl) : null;
  const canUseVimeo = Boolean(lesson.hasVimeoVideo);
  const canPreview = Boolean(canUseVimeo || ytVideoId);
  // Busca o embed cedo para mostrar o poster do Vimeo no lugar da capa estática.
  const { data: vimeoVideo } = useLessonVideo(courseId, lesson.id, canUseVimeo);
  const shouldMountYoutubeIframe = Boolean(ytVideoId && isHovering);
  // Mantém o iframe Vimeo montado para exibir o frame/poster inicial do vídeo.
  const shouldMountVimeoIframe = Boolean(canUseVimeo && vimeoVideo?.vimeoVideoId);
  const canToggleSubtitle = Boolean(ytVideoId || canUseVimeo);
  const youtubeThumbSrc = ytVideoId ? youtubeThumbnailUrl(ytVideoId) : null;
  const youtubePreviewSrc = ytVideoId
    ? `https://www.youtube.com/embed/${ytVideoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1&loop=1&playlist=${ytVideoId}&cc_load_policy=1&cc_lang_pref=pt&enablejsapi=1`
    : null;
  const vimeoPreviewSrc =
    shouldMountVimeoIframe && vimeoVideo?.vimeoVideoId
      ? buildVimeoPreviewSrc(vimeoVideo.embedUrl, vimeoVideo.vimeoVideoId)
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

  const applyVimeoPreferences = (audioEnabled: boolean, subtitleEnabled: boolean) => {
    sendVimeoCommand(vimeoFrameRef.current, 'setMuted', !audioEnabled);
    sendVimeoCommand(vimeoFrameRef.current, 'setVolume', audioEnabled ? 1 : 0);
    if (subtitleEnabled) {
      // Player API: enableTextTrack(kind, language)
      sendVimeoCommand(vimeoFrameRef.current, 'enableTextTrack', ['captions', 'pt']);
      return;
    }
    sendVimeoCommand(vimeoFrameRef.current, 'disableTextTrack');
  };

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

  useEffect(() => {
    if (!shouldMountVimeoIframe || !isVimeoReady) return;
    if (isHovering) {
      applyVimeoPreferences(isAudioEnabled, isSubtitleEnabled);
      sendVimeoCommand(vimeoFrameRef.current, 'play');
      const retry1 = window.setTimeout(() => {
        applyVimeoPreferences(isAudioEnabled, isSubtitleEnabled);
        sendVimeoCommand(vimeoFrameRef.current, 'play');
      }, 220);
      const retry2 = window.setTimeout(() => applyVimeoPreferences(isAudioEnabled, isSubtitleEnabled), 520);
      return () => {
        window.clearTimeout(retry1);
        window.clearTimeout(retry2);
      };
    }
    sendVimeoCommand(vimeoFrameRef.current, 'setMuted', true);
    sendVimeoCommand(vimeoFrameRef.current, 'pause');
    sendVimeoCommand(vimeoFrameRef.current, 'setCurrentTime', 0);
  }, [isAudioEnabled, isSubtitleEnabled, shouldMountVimeoIframe, isVimeoReady, isHovering]);

  useEffect(() => {
    if (!shouldMountVimeoIframe) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== VIMEO_PLAYER_ORIGIN) return;
      let data: { event?: string } | null = null;
      try {
        data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }
      if (data?.event === 'ready') {
        setIsVimeoReady(true);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [shouldMountVimeoIframe]);

  useEffect(() => {
    if (!isHovering) {
      setIsYoutubeReady(false);
    }
  }, [isHovering]);

  useInViewportWarmup(
    containerRef,
    () => setIsPreviewWarmedUp(true),
    {
      enabled: canPreview && !isPreviewWarmedUp,
      delayMs: 400 + preloadOrder * 700,
    },
  );

  useEffect(() => {
    if (!isPreviewWarmedUp) return;
    const hosts = ytVideoId
      ? ['https://www.youtube.com', 'https://i.ytimg.com']
      : canUseVimeo
        ? [VIMEO_PLAYER_ORIGIN, 'https://i.vimeocdn.com']
        : [];
    for (const href of hosts) {
      if (!document.querySelector(`link[rel="preconnect"][href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = href;
        document.head.appendChild(link);
      }
    }
  }, [isPreviewWarmedUp, ytVideoId, canUseVimeo]);

  const handlePreviewStart = () => {
    setIsHovering(true);
    setIsAudioEnabled(audioPreferenceEnabled);
    setIsSubtitleEnabled(true);
  };

  const handlePreviewStop = () => {
    setIsHovering(false);
    setIsAudioEnabled(audioPreferenceEnabled);
    setIsSubtitleEnabled(false);
    if (youtubeFrameRef.current) {
      sendYoutubeCommand('mute');
      sendYoutubeCommand('stopVideo');
    }
    if (vimeoFrameRef.current) {
      sendVimeoCommand(vimeoFrameRef.current, 'setMuted', true);
      sendVimeoCommand(vimeoFrameRef.current, 'pause');
      sendVimeoCommand(vimeoFrameRef.current, 'setCurrentTime', 0);
    }
  };

  const handleToggleAudio: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const nextAudioEnabled = !isAudioEnabled;
    setIsAudioEnabled(nextAudioEnabled);
    onAudioPreferenceChange(nextAudioEnabled);
    if (shouldMountYoutubeIframe && isYoutubeReady) {
      applyYoutubePreferences(nextAudioEnabled, isSubtitleEnabled);
    }
    if (shouldMountVimeoIframe && isVimeoReady) {
      applyVimeoPreferences(nextAudioEnabled, isSubtitleEnabled);
    }
  };

  const handleToggleSubtitle: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!canToggleSubtitle) return;
    const nextSubtitleEnabled = !isSubtitleEnabled;
    setIsSubtitleEnabled(nextSubtitleEnabled);
    if (shouldMountVimeoIframe && isVimeoReady) {
      applyVimeoPreferences(isAudioEnabled, nextSubtitleEnabled);
    }
  };

  const handleYoutubeLoaded = () => {
    setIsYoutubeReady(true);
    applyYoutubePreferences(isAudioEnabled, isSubtitleEnabled);
  };

  const handleVimeoLoaded = () => {
    setIsVimeoReady(true);
    // Poster parado até o hover; evita áudio no carregamento.
    sendVimeoCommand(vimeoFrameRef.current, 'setMuted', true);
    sendVimeoCommand(vimeoFrameRef.current, 'pause');
    sendVimeoCommand(vimeoFrameRef.current, 'setCurrentTime', 0);
  };

  if (visualOnly) {
    const subtitleText = lesson.description?.trim()
      ? normalizePtBrText(lesson.description)
      : normalizePtBrText(courseTitle);

    return (
      <Link
        ref={containerRef as React.Ref<HTMLAnchorElement>}
        to={`/student/courses/${courseId}/lessons/${lesson.id}`}
        className={cn(
          'group gc-lesson-card gc-lesson-card--stacked h-full w-full min-w-0 cursor-pointer border border-border/80 bg-card',
          'transition-all duration-300 ease-out motion-reduce:transition-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          className,
        )}
        aria-label={label}
      >
        <div
          className="gc-lesson-card-media-wrap"
          onMouseEnter={canPreview ? handlePreviewStart : undefined}
          onMouseLeave={canPreview ? handlePreviewStop : undefined}
        >
          <div
            className="gc-lesson-card-media absolute inset-0 bg-gradient-to-br from-primary/25 via-primary/10 to-muted"
            aria-hidden
          />
          {youtubeThumbSrc && !shouldMountYoutubeIframe ? (
            <img
              src={youtubeThumbSrc}
              alt=""
              loading="lazy"
              className={cn(
                'gc-lesson-card-media absolute inset-0 z-[1] h-full w-full object-cover transition-transform duration-200',
                isHovering && !canPreview && 'scale-[1.03]',
              )}
            />
          ) : null}
          {shouldMountYoutubeIframe && youtubePreviewSrc ? (
            <iframe
              ref={youtubeFrameRef}
              src={youtubePreviewSrc}
              title={`Prévia da aula ${normalizePtBrText(lesson.title)}`}
              allow="autoplay; encrypted-media; picture-in-picture"
              className="pointer-events-none absolute inset-0 z-[3] h-full w-full object-cover opacity-100"
              onLoad={handleYoutubeLoaded}
              tabIndex={-1}
              aria-hidden
            />
          ) : null}
          {shouldMountVimeoIframe && vimeoPreviewSrc ? (
            <iframe
              ref={vimeoFrameRef}
              src={vimeoPreviewSrc}
              title={`Prévia da aula ${normalizePtBrText(lesson.title)}`}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              className={cn(
                'pointer-events-none absolute inset-0 z-[3] h-full w-full object-cover opacity-100',
                isHovering && 'scale-[1.03]',
              )}
              onLoad={handleVimeoLoaded}
              tabIndex={-1}
              aria-hidden
            />
          ) : null}

          <div className="gc-lesson-card-media-scrim" aria-hidden />

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
        </div>

        <div className="gc-lesson-card-body">
          <span className="gc-lesson-module-badge truncate">
            {normalizePtBrText(lesson.moduleTitle)}
          </span>
          <h3 className="gc-lesson-card-title line-clamp-2">
            {normalizePtBrText(lesson.title)}
          </h3>
          <p className="gc-lesson-card-desc line-clamp-2">{subtitleText || '\u00A0'}</p>
          <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
            <Badge variant="outline" className="px-2 py-0 text-[10px] font-semibold uppercase tracking-wide sm:text-[11px]">
              {lesson.type}
            </Badge>
            {lesson.isCompleted ? (
              <Badge className="bg-emerald-600 px-2 py-0 text-[10px] font-semibold hover:bg-emerald-600 sm:text-[11px]">
                Assistida
              </Badge>
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
      {youtubeThumbSrc && !shouldMountYoutubeIframe ? (
        <img
          src={youtubeThumbSrc}
          alt=""
          loading="lazy"
          className={cn(
            'absolute inset-0 z-[1] h-full w-full object-cover transition-transform duration-200',
            isHovering && !canPreview && 'scale-[1.03]',
          )}
        />
      ) : null}
      {shouldMountYoutubeIframe && youtubePreviewSrc ? (
        <iframe
          ref={youtubeFrameRef}
          src={youtubePreviewSrc}
          title={`Prévia da aula ${normalizePtBrText(lesson.title)}`}
          allow="autoplay; encrypted-media; picture-in-picture"
          className="pointer-events-none absolute inset-0 z-[3] h-full w-full opacity-100"
          onLoad={handleYoutubeLoaded}
          tabIndex={-1}
          aria-hidden
        />
      ) : null}
      {shouldMountVimeoIframe && vimeoPreviewSrc ? (
        <iframe
          ref={vimeoFrameRef}
          src={vimeoPreviewSrc}
          title={`Prévia da aula ${normalizePtBrText(lesson.title)}`}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          className={cn(
            'pointer-events-none absolute inset-0 z-[3] h-full w-full opacity-100',
            isHovering && 'scale-[1.03]',
          )}
          onLoad={handleVimeoLoaded}
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
      ref={containerRef as React.Ref<HTMLAnchorElement>}
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
    <Card className="premium-card gc-metric-card h-full border-border/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none">
      <CardContent className="flex min-h-[7.5rem] flex-col gap-2 p-3 sm:min-h-[8.5rem] sm:flex-row sm:items-center sm:gap-3.5 sm:p-5">
        <div
          className={cn(
            'gc-metric-icon-wrap flex h-8 w-8 shrink-0 items-center justify-center rounded-full [&_svg]:h-4 [&_svg]:w-4 sm:h-11 sm:w-11 sm:self-center sm:[&_svg]:h-5 sm:[&_svg]:w-5',
            iconWrapClass,
          )}
        >
          {icon}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
          {children}
          {footer ? <div className="mt-0.5">{footer}</div> : null}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    if (href.startsWith('http://') || href.startsWith('https://')) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="group block h-full min-w-0"
        >
          {card}
        </a>
      );
    }

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
    <div className="w-full min-w-0 space-y-6 sm:space-y-8">
      {/* Banner de boas-vindas */}
      <div className="gc-welcome-banner relative overflow-hidden rounded-[22px] border border-border/80 bg-gradient-to-br from-card via-gc-ice/90 to-primary/[0.06] shadow-sm dark:border-border/80">
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

        <div className="relative flex flex-col justify-center px-6 py-7 sm:px-8 sm:py-9 md:px-10 md:py-10">
          <h1 className="font-display text-[1.75rem] font-bold leading-tight sm:text-[2rem] md:text-[2.25rem]">
            <span className="text-gc-text dark:text-foreground">Olá, </span>
            <span className="bg-gradient-to-r from-primary via-primary to-gc-teal bg-clip-text text-transparent dark:gc-welcome-name">
              {firstName ? normalizePtBrText(firstName) : 'visitante'}
            </span>
            <span className="text-gc-text dark:text-foreground">! </span>
            <span aria-hidden className="inline-block align-middle">👋</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-gc-gray-text dark:text-muted-foreground sm:text-[15px] sm:leading-7">
            Continue sua jornada de aprendizado e{' '}
            <span className="font-medium text-gc-text/90 dark:text-foreground/90">evolua constantemente</span>. Cada aula concluída é um
            passo a mais no avanço da sua carreira.
          </p>
        </div>
      </div>

      {/* 4 cards informativos */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4 [&>*]:h-full [&>*]:min-w-0">
        <DashboardInfoCard
          icon={<Target className="text-orange-500" aria-hidden />}
          iconWrapClass="bg-orange-100 dark:bg-orange-500/12 dark:text-orange-400"
          footer={
            <p className="text-[9px] leading-snug text-muted-foreground sm:text-[10px]">
              {completedLessons} de {totalPublishedLessons} aula{totalPublishedLessons !== 1 ? 's' : ''} concluída
              {completedLessons !== 1 ? 's' : ''}
            </p>
          }
        >
          <p className="gc-metric-value text-xl font-bold leading-none tabular-nums sm:text-2xl">{progressRounded}%</p>
          <p className="gc-metric-label text-[10px] font-medium text-muted-foreground sm:text-xs">Meu Progresso</p>
          <Progress value={home.mural.progressPercent} className="gc-progress-premium mt-1.5 sm:mt-2" />
        </DashboardInfoCard>

        <DashboardInfoCard
          icon={<PlayCircle className="text-teal-500" aria-hidden />}
          iconWrapClass="bg-teal-100 dark:bg-teal-500/12 dark:text-teal-400"
          href={nextLesson && !isCourseCompleted ? `/student/courses/${home.courseId}/lessons/${nextLesson.lessonId}` : undefined}
          footer={
            nextLesson && !isCourseCompleted ? (
              <p className="text-[9px] font-medium text-primary group-hover:underline sm:text-[10px]">Continuar →</p>
            ) : undefined
          }
        >
          <p className="line-clamp-2 break-words text-[11px] font-bold leading-snug text-foreground sm:text-base lg:text-lg dark:gc-metric-value dark:text-[1.125rem] dark:sm:text-xl">
            {nextLesson && !isCourseCompleted
              ? normalizePtBrText(nextLesson.title)
              : totalPublishedLessons === 0
                ? 'Nenhuma aula publicada'
                : 'Curso concluído! 🎉'}
          </p>
          <p className="gc-metric-label text-[10px] font-medium text-muted-foreground sm:text-xs">Próxima Aula</p>
        </DashboardInfoCard>

        <DashboardInfoCard
          icon={<LayoutList className="text-yellow-500" aria-hidden />}
          iconWrapClass="bg-yellow-100 dark:bg-yellow-500/12 dark:text-yellow-400"
          footer={
            <p className="text-[9px] leading-snug text-muted-foreground sm:text-[10px]">
              {totalModules > 0
                ? `${totalModules} ${totalModules === 1 ? 'módulo' : 'módulos'} no curso`
                : 'Nenhum módulo cadastrado'}
            </p>
          }
        >
          <p className="gc-metric-value text-xl font-bold leading-none tabular-nums sm:text-2xl">{remainingLessons}</p>
          <p className="gc-metric-label text-[10px] font-medium text-muted-foreground sm:text-xs">Aulas Restantes</p>
        </DashboardInfoCard>

        <DashboardInfoCard
          icon={<FileText className="text-primary" aria-hidden />}
          iconWrapClass="bg-primary/10 dark:bg-primary/12 dark:text-primary"
          href={COURSE_MATERIALS_DRIVE_URL}
          footer={
            <p className="text-[9px] font-medium text-primary group-hover:underline sm:text-[10px]">
              Acessar materiais →
            </p>
          }
        >
          <p className="line-clamp-2 break-words text-[11px] font-bold leading-snug text-foreground sm:text-base lg:text-lg dark:gc-metric-value dark:text-[1.125rem] dark:sm:text-xl">
            Materiais complementares
          </p>
          <p className="gc-metric-label text-[10px] font-medium text-muted-foreground sm:text-xs">Arquivos e documentos</p>
        </DashboardInfoCard>
      </div>

      {/* Seção de aulas em destaque */}
      <section aria-labelledby="lessons-heading" className="space-y-4 sm:space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-1.5">
            <h2 id="lessons-heading" className="min-w-0 break-words font-display text-lg font-bold sm:text-xl md:text-2xl">
              <span className="gc-section-title-accent text-gc-coral">Início do módulo</span>
              {' '}
              <span className="text-foreground">— aulas em destaque</span>
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Continue de onde parou ou avance para os próximos conteúdos recomendados.
            </p>
          </div>
          <Link
            to={`/student/courses/${home.courseId}/lessons/start`}
            className="gc-section-link inline-flex shrink-0 items-center gap-1 hover:underline"
          >
            Ver todas as aulas
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {featuredLessons.length > 0 ? (
          <Carousel opts={lessonsCarouselOptions} className="w-full">
            <CarouselContent className="-ml-3 items-stretch sm:-ml-4">
              {featuredLessons.map((lesson, idx) => (
                <CarouselItem
                  key={lesson.id}
                  className="basis-[88%] pl-3 min-[420px]:basis-[62%] sm:basis-[48%] sm:pl-4 md:basis-[38%] lg:basis-[28%] xl:basis-1/4"
                >
                  <LessonPreviewCard
                    courseId={home.courseId}
                    courseTitle={home.courseTitle}
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
                  className="basis-[88%] pl-3 min-[420px]:basis-[62%] sm:basis-[48%] sm:pl-4 md:basis-[38%] lg:basis-[28%] xl:basis-1/4"
                >
                  <Card className="gc-lesson-card--stacked premium-card flex h-full min-h-[18rem] min-w-0 flex-col items-center justify-center border-dashed border-muted-foreground/25 bg-muted/10 px-3 text-center text-xs text-muted-foreground sm:min-h-[20rem] sm:text-sm">
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
