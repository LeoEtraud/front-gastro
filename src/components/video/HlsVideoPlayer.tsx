import { memo, useRef, useState, type Ref } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useHlsPlayer } from '@/hooks/use-hls-player';
import { useInViewportPause } from '@/hooks/use-in-viewport-pause';
import { cn } from '@/lib/utils';

export type HlsVideoPlayerProps = {
  src: string;
  /** URL MP4 de fallback quando HLS não carregar. */
  fallbackSrc?: string | null;
  poster?: string;
  className?: string;
  videoClassName?: string;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  controlsList?: string;
  /** Quando false, adia a inicialização do HLS (lazy loading). */
  active?: boolean;
  /** Pausa automaticamente ao sair do viewport. */
  pauseWhenHidden?: boolean;
  onLoadedMetadata?: () => void;
  onError?: (message: string) => void;
  /** Ref opcional para controlar play/pause externamente (prévias em cards). */
  videoRef?: Ref<HTMLVideoElement | null>;
  /** Exibe spinner de carregamento. Desligue em prévias compactas. */
  showLoadingOverlay?: boolean;
};

function HlsVideoPlayerInner({
  src,
  fallbackSrc,
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
  onLoadedMetadata,
  onError,
  videoRef: externalVideoRef,
  showLoadingOverlay = true,
}: HlsVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const internalVideoRef = useRef<HTMLVideoElement | null>(null);

  const setVideoRef = (node: HTMLVideoElement | null) => {
    internalVideoRef.current = node;
    if (typeof externalVideoRef === 'function') {
      externalVideoRef(node);
    } else if (externalVideoRef && 'current' in externalVideoRef) {
      externalVideoRef.current = node;
    }
  };
  const [hasStarted, setHasStarted] = useState(false);

  const effectivePreload = hasStarted ? preload : preload === 'auto' ? 'metadata' : preload;

  const { status, errorMessage } = useHlsPlayer(internalVideoRef, {
    src,
    fallbackSrc,
    active,
    onFatalError: onError,
  });

  useInViewportPause(containerRef, internalVideoRef, {
    enabled: pauseWhenHidden && active,
  });

  const showLoading = active && (status === 'loading' || status === 'idle');
  const showError = status === 'error' || status === 'unsupported';

  return (
    <div ref={containerRef} className={cn('relative h-full w-full bg-black', className)}>
      <video
        ref={setVideoRef}
        poster={poster}
        controls={controls}
        muted={muted}
        loop={loop}
        playsInline={playsInline}
        preload={effectivePreload}
        controlsList={controlsList}
        className={cn('h-full w-full object-contain', videoClassName)}
        onLoadedMetadata={onLoadedMetadata}
        onPlay={() => setHasStarted(true)}
      />

      {showLoadingOverlay && showLoading ? (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40"
          aria-hidden
        >
          <Loader2 className="h-10 w-10 animate-spin text-white/80" />
        </div>
      ) : null}

      {showError ? (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/85 px-4 text-center text-sm text-white"
          role="alert"
        >
          <AlertCircle className="h-8 w-8 text-white/70" aria-hidden />
          <p>{errorMessage ?? 'Não foi possível reproduzir este vídeo.'}</p>
        </div>
      ) : null}
    </div>
  );
}

export const HlsVideoPlayer = memo(HlsVideoPlayerInner);
