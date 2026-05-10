import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SectionCarouselProps = {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function SectionCarousel({ id, title, description, children, className }: SectionCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanPrev(scrollLeft > 8);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 8);
  }, []);

  const scrollByDir = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const delta = Math.round(el.clientWidth * 0.72) * dir;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  useEffect(() => {
    const run = () => requestAnimationFrame(() => updateArrows());
    const id = run();
    window.addEventListener('resize', updateArrows);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('resize', updateArrows);
    };
  }, [updateArrows]);

  return (
    <section id={id} className={cn('relative py-10 sm:py-12 md:py-14', className)}>
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <h2 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl md:text-3xl">
              {title}
            </h2>
            {description ? (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">{description}</p>
            ) : null}
          </div>
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollByDir(-1)}
              disabled={!canPrev}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-cyan-600/40 hover:bg-cyan-50 hover:text-cyan-900 disabled:pointer-events-none disabled:opacity-35"
              aria-label="Rolar carrossel para a esquerda"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => scrollByDir(1)}
              disabled={!canNext}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-cyan-600/40 hover:bg-cyan-50 hover:text-cyan-900 disabled:pointer-events-none disabled:opacity-35"
              aria-label="Rolar carrossel para a direita"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>

        <div className="relative">
          <div
            ref={scrollerRef}
            onScroll={updateArrows}
            className={cn(
              'flex gap-4 overflow-x-auto pb-2 pt-1 [-ms-overflow-style:none] [scrollbar-width:none]',
              'snap-x snap-mandatory scroll-ps-4 scroll-pe-4 sm:gap-5',
              '[&::-webkit-scrollbar]:hidden',
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
