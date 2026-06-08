import { useEffect } from 'react';

/**
 * Pausa o vídeo quando o elemento sai do viewport — evita reprodução
 * em background e libera buffer de mídia em listas/carrosséis.
 */
export function useInViewportPause(
  containerRef: React.RefObject<Element | null>,
  videoRef: React.RefObject<HTMLVideoElement | null>,
  options: {
    enabled?: boolean;
    threshold?: number;
  } = {},
): void {
  const { enabled = true, threshold = 0.15 } = options;

  useEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && !video.paused) {
          video.pause();
        }
      },
      { threshold },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, videoRef, enabled, threshold]);
}
