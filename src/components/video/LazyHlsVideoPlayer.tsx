import { memo, useEffect, useRef, useState } from 'react';
import { HlsVideoPlayer, type HlsVideoPlayerProps } from '@/components/video/HlsVideoPlayer';
import { cn } from '@/lib/utils';

type LazyHlsVideoPlayerProps = Omit<HlsVideoPlayerProps, 'active'> & {
  /** % visível para montar o player. Padrão: 0.1 */
  threshold?: number;
  /** Margem extra antes de montar (ex.: "200px 0px"). */
  rootMargin?: string;
  /** Placeholder enquanto o player não foi montado. */
  placeholderClassName?: string;
};

function LazyHlsVideoPlayerInner({
  threshold = 0.1,
  rootMargin = '200px 0px',
  placeholderClassName,
  poster,
  className,
  ...playerProps
}: LazyHlsVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <div ref={containerRef} className={cn('relative aspect-video w-full', className)}>
      {!isNearViewport ? (
        <div
          className={cn(
            'absolute inset-0 bg-black',
            poster ? 'bg-cover bg-center' : 'bg-muted',
            placeholderClassName,
          )}
          style={poster ? { backgroundImage: `url(${poster})` } : undefined}
          aria-hidden
        />
      ) : (
        <HlsVideoPlayer
          {...playerProps}
          poster={poster}
          className="absolute inset-0"
          active={isNearViewport}
          pauseWhenHidden
        />
      )}
    </div>
  );
}

export const LazyHlsVideoPlayer = memo(LazyHlsVideoPlayerInner);
