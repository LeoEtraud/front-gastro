import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { canPlayNativeHls, isAllowedPlaybackUrl, isHlsPlaybackUrl } from '@/lib/video-playback';

export type HlsPlayerStatus = 'idle' | 'loading' | 'ready' | 'error' | 'unsupported';

type UseHlsPlayerOptions = {
  src: string | null | undefined;
  /** URL MP4 progressiva quando HLS não estiver disponível ou falhar. */
  fallbackSrc?: string | null;
  /** Quando false, não inicializa o player (lazy loading). */
  active?: boolean;
  onFatalError?: (message: string) => void;
};

type UseHlsPlayerResult = {
  status: HlsPlayerStatus;
  errorMessage: string | null;
  /** true quando a URL não é HLS (progressivo externo). */
  isProgressive: boolean;
};

const DEFAULT_ERROR = 'Não foi possível carregar este vídeo. Tente novamente em instantes.';
const MAX_NETWORK_RETRIES = 2;

export function useHlsPlayer(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  { src, fallbackSrc, active = true, onFatalError }: UseHlsPlayerOptions,
): UseHlsPlayerResult {
  const hlsRef = useRef<Hls | null>(null);
  const onFatalErrorRef = useRef(onFatalError);
  onFatalErrorRef.current = onFatalError;

  const [status, setStatus] = useState<HlsPlayerStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProgressive, setIsProgressive] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(src?.trim() ? src : null);
  const lastPrimarySrcRef = useRef(src);

  useEffect(() => {
    if (src !== lastPrimarySrcRef.current) {
      lastPrimarySrcRef.current = src;
      setCurrentSrc(src?.trim() ? src : null);
    }
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    const playbackSrc = currentSrc;

    if (!video || !active || !playbackSrc?.trim()) {
      setStatus('idle');
      setErrorMessage(null);
      setIsProgressive(false);
      return;
    }

    if (!isAllowedPlaybackUrl(playbackSrc)) {
      setStatus('error');
      setErrorMessage('URL de vídeo não autorizada.');
      onFatalErrorRef.current?.('URL de vídeo não autorizada.');
      return;
    }

    const destroyHls = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };

    const fail = (message: string) => {
      destroyHls();
      video.removeAttribute('src');
      video.load();
      setStatus('error');
      setErrorMessage(message);
      onFatalErrorRef.current?.(message);
    };

    const tryFallback = (): boolean => {
      if (!fallbackSrc?.trim() || fallbackSrc === playbackSrc) return false;
      if (!isAllowedPlaybackUrl(fallbackSrc)) return false;
      destroyHls();
      setCurrentSrc(fallbackSrc);
      return true;
    };

    destroyHls();
    setErrorMessage(null);
    setStatus('loading');

    let networkRetries = 0;

    const handleCanPlay = () => {
      setStatus('ready');
    };

    const handleVideoError = () => {
      if (tryFallback()) return;
      fail(DEFAULT_ERROR);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleVideoError);

    if (!isHlsPlaybackUrl(playbackSrc)) {
      setIsProgressive(true);
      video.src = playbackSrc;
      video.load();
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleVideoError);
        video.pause();
        video.removeAttribute('src');
        video.load();
      };
    }

    setIsProgressive(false);

    if (canPlayNativeHls(video)) {
      video.src = playbackSrc;
      video.load();
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleVideoError);
        video.pause();
        video.removeAttribute('src');
        video.load();
      };
    }

    if (!Hls.isSupported()) {
      if (tryFallback()) return;
      setStatus('unsupported');
      setErrorMessage('Seu navegador não suporta reprodução deste vídeo.');
      onFatalErrorRef.current?.('Navegador sem suporte a HLS.');
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleVideoError);
      };
    }

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
      startLevel: -1,
      capLevelToPlayerSize: true,
      backBufferLength: 30,
    });

    hlsRef.current = hls;
    hls.attachMedia(video);
    hls.loadSource(playbackSrc);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      setStatus('ready');
    });

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (!data.fatal) return;

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        networkRetries += 1;
        if (networkRetries <= MAX_NETWORK_RETRIES) {
          hls.startLoad();
          return;
        }
        if (tryFallback()) return;
        fail(DEFAULT_ERROR);
        return;
      }

      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
        return;
      }

      if (tryFallback()) return;
      fail(DEFAULT_ERROR);
    });

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleVideoError);
      video.pause();
      destroyHls();
      video.removeAttribute('src');
      video.load();
      setStatus('idle');
    };
  }, [currentSrc, fallbackSrc, active, videoRef]);

  return { status, errorMessage, isProgressive };
}
