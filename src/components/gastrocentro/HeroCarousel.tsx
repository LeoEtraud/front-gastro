import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GastroButton } from '@/components/gastrocentro/GastroButton';
import { GC_SCROLL_ANCHOR, GastroContainer, GastroSection } from '@/components/gastrocentro/GastroLayout';
import { heroSlides } from '@/data/gastrocentro-landing';
import { useCarousel } from '@/hooks/use-carousel';
import { cn } from '@/lib/utils';

export function HeroCarousel() {
  const { index, goTo, next, prev, setPaused, onTouchStart, onTouchEnd, reducedMotion } = useCarousel({
    length: heroSlides.length,
    autoplayMs: 3200,
  });

  const slide = heroSlides[index];

  return (
    <section
      id="topo"
      className={cn('gc-font relative w-full overflow-hidden bg-gc-navy', GC_SCROLL_ANCHOR)}
      aria-roledescription="carrossel"
      aria-label="Conteúdos em destaque"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => onTouchStart(e.changedTouches[0].clientX)}
      onTouchEnd={(e) => onTouchEnd(e.changedTouches[0].clientX)}
    >
      <div className="relative min-h-[min(520px,85vh)] overflow-hidden sm:min-h-[560px] lg:min-h-[620px]">
        {heroSlides.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              'absolute inset-0 transition-opacity duration-500 ease-in-out',
              i === index ? 'z-[1] opacity-100' : 'z-0 opacity-0',
            )}
            aria-hidden={i !== index}
          >
            <img
              src={s.imageSrc}
              alt={s.imageAlt}
              className={cn(
                'absolute inset-0 h-full w-full object-cover',
                i === index && !reducedMotion && 'gc-ken-burns',
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gc-navy via-gc-navy/90 to-gc-navy/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-gc-navy/90 via-transparent to-gc-navy/20" />
          </div>
        ))}

        <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden" aria-hidden>
          <div className="absolute -right-12 top-16 h-56 w-56 rounded-full bg-gc-teal/15 blur-3xl" />
          <div className="absolute bottom-12 left-8 h-40 w-40 rounded-full bg-gc-coral/12 blur-3xl" />
        </div>

        <GastroSection className="relative z-[3] flex min-h-[inherit] items-center py-8 sm:py-10 lg:py-12">
          <GastroContainer className="w-full">
            <div key={slide.id} className={cn('min-w-0 max-w-3xl', !reducedMotion && 'gc-slide-up')}>
              <span className="inline-flex rounded-full border border-gc-teal/30 bg-gc-teal/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gc-teal">
                {slide.badge}
              </span>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-[2.65rem]">
                {slide.title}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">{slide.subtitle}</p>
              <div className="mt-8 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
                <GastroButton href={slide.primaryHref} variant="primary" size="lg" className="w-full sm:w-auto">
                  {slide.primaryCta}
                </GastroButton>
                <GastroButton href={slide.secondaryHref} variant="secondary" size="lg" className="w-full sm:w-auto">
                  {slide.secondaryCta}
                </GastroButton>
              </div>
            </div>
          </GastroContainer>
        </GastroSection>

        <button
          type="button"
          onClick={prev}
          className="absolute left-[max(1rem,env(safe-area-inset-left))] top-1/2 z-[4] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-gc-navy/70 text-white backdrop-blur-sm transition hover:bg-white/10 sm:flex"
          aria-label="Slide anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={next}
          className="absolute right-[max(1rem,env(safe-area-inset-right))] top-1/2 z-[4] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-gc-navy/70 text-white backdrop-blur-sm transition hover:bg-white/10 sm:flex"
          aria-label="Próximo slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-6 left-1/2 z-[4] flex -translate-x-1/2 gap-2">
          {heroSlides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(i)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === index ? 'w-8 bg-gc-coral' : 'w-1.5 bg-white/40 hover:bg-white/60',
              )}
              aria-label={`Ir para slide ${i + 1}: ${s.title}`}
              aria-current={i === index ? 'true' : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
