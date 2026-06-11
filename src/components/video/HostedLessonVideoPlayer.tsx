import { useCallback, useEffect, type Ref } from 'react';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HlsVideoPlayer } from '@/components/video/HlsVideoPlayer';
import { useLessonVideoUrl, type LessonVideoUrlOptions } from '@/hooks/use-lesson-video-url';
import { cn } from '@/lib/utils';

type HostedLessonVideoPlayerProps = {
  lessonId: string;
  enabled?: boolean;
  poster?: string;
  className?: string;
  videoClassName?: string;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  controlsList?: string;
  active?: boolean;
  pauseWhenHidden?: boolean;
  showLoadingOverlay?: boolean;
  /** Exibe spinner enquanto busca a URL assinada. Desligue em prévias compactas. */
  showUrlLoading?: boolean;
  /** playback = aula principal; preview = cards da home (MP4, buffer menor). */
  playerMode?: 'playback' | 'preview';
  /** Opções da API video-url (ex.: preferFormat mp4 para prévias). */
  urlOptions?: LessonVideoUrlOptions;
  videoRef?: Ref<HTMLVideoElement | null>;
  onLoadedMetadata?: () => void;
};

function accessErrorMessage(status: number | undefined): string {
  if (status === 403) return 'Você não tem permissão para assistir este vídeo.';
  if (status === 404) return 'Vídeo não encontrado para esta aula.';
  if (status === 503) return 'Reprodução de vídeo temporariamente indisponível.';
  return 'Não foi possível carregar o vídeo. Tente novamente.';
}

export function HostedLessonVideoPlayer({
  lessonId,
  enabled = true,
  poster,
  className,
  videoClassName,
  controls = true,
  muted = false,
  loop = false,
  playsInline = true,
  preload = 'metadata',
  controlsList = 'nodownload',
  active = true,
  pauseWhenHidden = false,
  showLoadingOverlay = true,
  showUrlLoading = true,
  playerMode = 'playback',
  urlOptions,
  videoRef,
  onLoadedMetadata,
}: HostedLessonVideoPlayerProps) {
  const { data, isLoading, isFetching, error, refetch } = useLessonVideoUrl(lessonId, enabled, urlOptions);

  const httpStatus = (error as { response?: { status?: number } } | undefined)?.response?.status;

  const refreshSignedUrl = useCallback(() => {
    void refetch();
  }, [refetch]);

  // Renova a URL assinada antes de expirar (30s de margem) — o player atualiza in-place.
  useEffect(() => {
    if (!data?.expiresAt || !enabled) return;
    const msUntilRefresh = new Date(data.expiresAt).getTime() - Date.now() - 30_000;
    if (msUntilRefresh <= 0) {
      refreshSignedUrl();
      return;
    }
    const timer = window.setTimeout(refreshSignedUrl, msUntilRefresh);
    return () => window.clearTimeout(timer);
  }, [data?.expiresAt, enabled, refreshSignedUrl]);

  const handlePlaybackError = useCallback(() => {
    refreshSignedUrl();
  }, [refreshSignedUrl]);

  if (showUrlLoading && (isLoading || (isFetching && !data))) {
    return (
      <div className={cn('relative flex aspect-video w-full items-center justify-center bg-black/85', className)}>
        <Loader2 className="h-10 w-10 animate-spin text-white/80" aria-hidden />
        <span className="sr-only">Carregando vídeo…</span>
      </div>
    );
  }

  if ((isLoading || isFetching) && !data?.url) {
    return null;
  }

  if (error || !data?.url) {
    return (
      <div
        className={cn(
          'relative flex aspect-video w-full flex-col items-center justify-center gap-3 bg-black/85 px-4 text-center text-sm text-white',
          className,
        )}
        role="alert"
      >
        <AlertCircle className="h-8 w-8 text-white/70" aria-hidden />
        <p>{accessErrorMessage(httpStatus)}</p>
        <Button type="button" variant="secondary" size="sm" onClick={refreshSignedUrl}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('relative aspect-video w-full shrink-0 bg-black', className)}>
      <HlsVideoPlayer
        src={data.url}
        fallbackSrc={data.fallbackUrl}
        poster={poster}
        controls={controls}
        controlsList={controlsList}
        muted={muted}
        loop={loop}
        playsInline={playsInline}
        preload={preload}
        active={active}
        pauseWhenHidden={pauseWhenHidden}
        showLoadingOverlay={showLoadingOverlay}
        playerMode={playerMode}
        withCredentials={data.usesSignedCookies ?? false}
        className="absolute inset-0"
        videoClassName={videoClassName ?? 'object-contain'}
        videoRef={videoRef}
        onLoadedMetadata={onLoadedMetadata}
        onError={handlePlaybackError}
      />
    </div>
  );
}
