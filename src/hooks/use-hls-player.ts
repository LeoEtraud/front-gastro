import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { canPlayNativeHls, isAllowedPlaybackUrl, isHlsPlaybackUrl } from '@/lib/video-playback';

export type HlsPlayerStatus = 'idle' | 'loading' | 'ready' | 'error' | 'unsupported';
export type HlsPlayerMode = 'playback' | 'preview';

type UseHlsPlayerOptions = {
  src: string | null | undefined;
  fallbackSrc?: string | null;
  active?: boolean;
  mode?: HlsPlayerMode;
  withCredentials?: boolean;
  onFatalError?: (message: string) => void;
};

type UseHlsPlayerResult = {
  status: HlsPlayerStatus;
  errorMessage: string | null;
  isProgressive: boolean;
};

const DEFAULT_ERROR = 'Não foi possível carregar este vídeo. Tente novamente em instantes.';
const MAX_NETWORK_RETRIES = 2;

function buildHlsConfig(mode: HlsPlayerMode, withCredentials: boolean) {
  const isPreview = mode === 'preview';
  return {
    enableWorker: true,
    lowLatencyMode: false,
    startLevel: 0,
    capLevelToPlayerSize: true,
    abrEwmaDefaultEstimate: isPreview ? 400_000 : 500_000,
    maxBufferLength: isPreview ? 10 : 20,
    maxMaxBufferLength: isPreview ? 20 : 40,
    backBufferLength: isPreview ? 10 : 20,
    xhrSetup: withCredentials
      ? (xhr: XMLHttpRequest) => {
          xhr.withCredentials = true;
        }
      : undefined,
  };
}

/** Mesmo recurso CDN — só a assinatura/query mudou (renovação de URL). */
function samePlaybackResource(a: string, b: string): boolean {
  try {
    const ua = new URL(a);
    const ub = new URL(b);
    return ua.origin === ub.origin && ua.pathname === ub.pathname;
  } catch {
    return a === b;
  }
}

export function useHlsPlayer(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  { src, fallbackSrc, active = true, mode = 'playback', withCredentials = false, onFatalError }: UseHlsPlayerOptions,
): UseHlsPlayerResult {
  const hlsRef = useRef<Hls | null>(null);
  const isProgressiveRef = useRef(false);
  const loadedSrcRef = useRef<string | null>(null);
  const pendingSrcRef = useRef<string | null>(null);
  const networkRetriesRef = useRef(0);
  const onFatalErrorRef = useRef(onFatalError);
  onFatalErrorRef.current = onFatalError;

  const [status, setStatus] = useState<HlsPlayerStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProgressive, setIsProgressive] = useState(false);
  const [playbackSrc, setPlaybackSrc] = useState<string | null>(src?.trim() ? src : null);

  useEffect(() => {
    setPlaybackSrc(src?.trim() ? src : null);
  }, [src]);

  useEffect(() => {
    pendingSrcRef.current = playbackSrc;

    const video = videoRef.current;
    const url = playbackSrc;

    if (!video || !active || !url?.trim()) {
      setStatus('idle');
      setErrorMessage(null);
      setIsProgressive(false);
      return;
    }

    if (!isAllowedPlaybackUrl(url)) {
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
      loadedSrcRef.current = null;
      video.removeAttribute('src');
      video.load();
      setStatus('error');
      setErrorMessage(message);
      onFatalErrorRef.current?.(message);
    };

    const tryFallback = (): boolean => {
      if (!fallbackSrc?.trim() || fallbackSrc === url) return false;
      if (!isAllowedPlaybackUrl(fallbackSrc)) return false;
      destroyHls();
      loadedSrcRef.current = null;
      setPlaybackSrc(fallbackSrc);
      return true;
    };

    // Renovação in-place: mesma mídia, nova assinatura.
    if (loadedSrcRef.current && samePlaybackResource(loadedSrcRef.current, url)) {
      const savedTime = video.currentTime;
      const wasPaused = video.paused;
      setStatus('loading');
      setErrorMessage(null);

      if (hlsRef.current) {
        hlsRef.current.loadSource(url);
        loadedSrcRef.current = url;
        networkRetriesRef.current = 0;
        hlsRef.current.once(Hls.Events.MANIFEST_PARSED, () => {
          if (savedTime > 0) video.currentTime = savedTime;
          if (!wasPaused) void video.play().catch(() => undefined);
          setStatus('ready');
        });
        return () => undefined;
      }

      if (isProgressiveRef.current) {
        video.src = url;
        loadedSrcRef.current = url;
        video.load();
        video.addEventListener(
          'canplay',
          () => {
            if (savedTime > 0) video.currentTime = savedTime;
            if (!wasPaused) void video.play().catch(() => undefined);
            setStatus('ready');
          },
          { once: true },
        );
        return () => undefined;
      }
    }

    destroyHls();
    loadedSrcRef.current = url;
    networkRetriesRef.current = 0;
    setErrorMessage(null);
    setStatus('loading');

    const handleCanPlay = () => setStatus('ready');
    const handleVideoError = () => {
      if (tryFallback()) return;
      fail(DEFAULT_ERROR);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleVideoError);

    if (!isHlsPlaybackUrl(url)) {
      isProgressiveRef.current = true;
      setIsProgressive(true);
      video.src = url;
      video.load();
      return () => {
        const next = pendingSrcRef.current;
        if (loadedSrcRef.current && next && samePlaybackResource(loadedSrcRef.current, next)) return;
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleVideoError);
        video.pause();
        destroyHls();
        video.removeAttribute('src');
        video.load();
        loadedSrcRef.current = null;
        isProgressiveRef.current = false;
        setStatus('idle');
      };
    }

    isProgressiveRef.current = false;
    setIsProgressive(false);

    if (canPlayNativeHls(video)) {
      video.src = url;
      video.load();
      return () => {
        const next = pendingSrcRef.current;
        if (loadedSrcRef.current && next && samePlaybackResource(loadedSrcRef.current, next)) return;
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleVideoError);
        video.pause();
        video.removeAttribute('src');
        video.load();
        loadedSrcRef.current = null;
        setStatus('idle');
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

    const hls = new Hls(buildHlsConfig(mode, withCredentials));
    hlsRef.current = hls;
    hls.attachMedia(video);
    hls.loadSource(url);

    hls.on(Hls.Events.MANIFEST_PARSED, () => setStatus('ready'));

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (!data.fatal) return;

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        networkRetriesRef.current += 1;
        if (networkRetriesRef.current <= MAX_NETWORK_RETRIES) {
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
      const next = pendingSrcRef.current;
      if (loadedSrcRef.current && next && samePlaybackResource(loadedSrcRef.current, next)) return;
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleVideoError);
      video.pause();
      destroyHls();
      video.removeAttribute('src');
      video.load();
      loadedSrcRef.current = null;
      isProgressiveRef.current = false;
      setStatus('idle');
    };
  }, [playbackSrc, fallbackSrc, active, mode, withCredentials, videoRef]);

  return { status, errorMessage, isProgressive };
}
