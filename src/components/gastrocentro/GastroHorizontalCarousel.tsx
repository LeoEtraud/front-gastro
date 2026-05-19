import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Largura fixa de cada slide no carrossel (especialidades / mídia). */
export const GC_MEDIA_CARD_SLIDE =
  'w-[min(78vw,280px)] shrink-0 snap-start sm:w-[300px]';

type GastroHorizontalCarouselProps = {
  children: ReactNode;
  slideCount: number;
  className?: string;
  'aria-label'?: string;
};

/** Mesmo estilo dos botões do carrossel do hero (vídeos). */
const navButtonBase =
  'absolute top-1/2 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-gc-navy/70 text-white backdrop-blur-sm transition hover:bg-white/10 disabled:pointer-events-none disabled:opacity-35 sm:h-11 sm:w-11';

export function GastroHorizontalCarousel({
  children,
  slideCount,
  className,
  'aria-label': ariaLabel = 'Carrossel de conteúdos',
}: GastroHorizontalCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(slideCount > 1);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanPrev(scrollLeft > 8);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 8);

    const slides = Array.from(el.querySelectorAll<HTMLElement>('[data-carousel-slide]'));
    if (slides.length === 0) return;

    const center = scrollLeft + clientWidth / 2;
    let closest = 0;
    let minDist = Infinity;

    slides.forEach((slide, i) => {
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const dist = Math.abs(center - slideCenter);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });

    setActiveIndex(closest);
  }, []);

  const scrollByDir = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const firstSlide = el.querySelector<HTMLElement>('[data-carousel-slide]');
    const gap = 16;
    const step = (firstSlide?.offsetWidth ?? el.clientWidth * 0.8) + gap;
    el.scrollBy({ left: step * dir, behavior: 'smooth' });
  };

  const scrollToIndex = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const slide = el.querySelectorAll<HTMLElement>('[data-carousel-slide]')[index];
    if (!slide) return;
    el.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
  };

  useEffect(() => {
    updateState();
    window.addEventListener('resize', updateState);
    return () => window.removeEventListener('resize', updateState);
  }, [slideCount, updateState]);

  const showControls = slideCount > 1;

  return (
    <div className={cn('relative mt-8 overflow-visible', className)} role="region" aria-label={ariaLabel}>
      {showControls ? (
        <>
          <button
            type="button"
            onClick={() => scrollByDir(-1)}
            disabled={!canPrev}
            className={cn(
              navButtonBase,
              'hidden sm:left-0 sm:inline-flex',
              '-translate-x-[calc(100%+0.625rem)] -translate-y-1/2 lg:-translate-x-[calc(100%+0.75rem)]',
            )}
            aria-label="Ver itens anteriores"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scrollByDir(1)}
            disabled={!canNext}
            className={cn(
              navButtonBase,
              'hidden sm:right-0 sm:inline-flex',
              'translate-x-[calc(100%+0.625rem)] -translate-y-1/2 lg:translate-x-[calc(100%+0.75rem)]',
            )}
            aria-label="Ver próximos itens"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </>
      ) : null}

      <div
        ref={scrollerRef}
        onScroll={updateState}
        className={cn(
          'w-full',
          'flex gap-4 overflow-x-auto pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none]',
          'snap-x snap-mandatory scroll-ps-0 scroll-pe-0 sm:gap-5',
          '[&::-webkit-scrollbar]:hidden',
        )}
      >
        {children}
      </div>

      {showControls ? (
        <div className="mt-4 flex justify-center gap-2" aria-hidden={slideCount <= 1}>
          {Array.from({ length: slideCount }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToIndex(i)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === activeIndex ? 'w-8 bg-gc-coral' : 'w-1.5 bg-gc-border hover:bg-gc-teal/50',
              )}
              aria-label={`Ir para item ${i + 1} de ${slideCount}`}
              aria-current={i === activeIndex ? 'true' : undefined}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
