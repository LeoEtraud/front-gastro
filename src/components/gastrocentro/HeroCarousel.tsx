import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GastroButton } from '@/components/gastrocentro/GastroButton';
import { handleGastroAnchorClick } from '@/components/gastrocentro/gastro-nav';
import { GC_SCROLL_ANCHOR, GastroContainer, GastroSection } from '@/components/gastrocentro/GastroLayout';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { GASTRO_INTRO_VIDEO_URL, heroSlides, type HeroSlide } from '@/data/gastrocentro-landing';
import { useCarousel } from '@/hooks/use-carousel';
import { cn } from '@/lib/utils';

const primaryButtonClass =
  'inline-flex h-[52px] items-center justify-center rounded-full bg-gc-coral px-8 text-[15px] font-semibold text-white shadow-[0_6px_20px_-4px_rgba(255,107,53,0.50)] transition-all duration-200 hover:bg-[#e85f2d] hover:shadow-[0_8px_28px_-4px_rgba(255,107,53,0.60)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gc-teal focus-visible:ring-offset-2 active:scale-[0.97]';

function HeroSlideBackground({
  slide,
  active,
  reducedMotion,
}: {
  slide: HeroSlide;
  active: boolean;
  reducedMotion: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [active]);

  return (
    <>
      {slide.videoSrc ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={slide.imageSrc}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={slide.videoSrc} type="video/mp4" />
          Seu navegador não suporta vídeo.
        </video>
      ) : (
        <img
          src={slide.imageSrc}
          alt={slide.imageAlt}
          className={cn(
            'absolute inset-0 h-full w-full object-cover',
            active && !reducedMotion && 'gc-ken-burns',
          )}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(3,24,48,0.97) 0%, rgba(5,38,72,0.82) 45%, rgba(5,38,72,0.42) 75%, rgba(5,38,72,0.18) 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(3,24,48,0.15) 0%, transparent 40%, rgba(3,24,48,0.60) 100%)',
        }}
      />
    </>
  );
}

export function HeroCarousel() {
  const [videoOpen, setVideoOpen] = useState(false);
  const { index, goTo, next, prev, setPaused, onTouchStart, onTouchEnd, reducedMotion } = useCarousel({
    length: heroSlides.length,
    autoplayMs: 4500,
  });

  const slide = heroSlides[index];

  const renderPrimaryCta = () => {
    if (slide.primaryAction === 'video') {
      return (
        <button type="button" onClick={() => setVideoOpen(true)} className={cn(primaryButtonClass, 'w-full sm:w-auto')}>
          {slide.primaryCta}
        </button>
      );
    }

    if (slide.primaryHref.startsWith('#')) {
      return (
        <a
          href={slide.primaryHref}
          onClick={(e) => handleGastroAnchorClick(e, slide.primaryHref)}
          className={cn(primaryButtonClass, 'w-full sm:w-auto')}
        >
          {slide.primaryCta}
        </a>
      );
    }

    return (
      <GastroButton href={slide.primaryHref} variant="primary" size="lg" className="w-full sm:w-auto">
        {slide.primaryCta}
      </GastroButton>
    );
  };

  return (
    <>
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
        <div className="relative min-h-[min(600px,88vh)] overflow-hidden sm:min-h-[660px] lg:min-h-[740px]">
          {heroSlides.map((s, i) => (
            <div
              key={s.id}
              className={cn(
                'absolute inset-0 transition-opacity duration-700 ease-in-out',
                i === index ? 'z-[1] opacity-100' : 'z-0 opacity-0',
              )}
              aria-hidden={i !== index}
            >
              <HeroSlideBackground slide={s} active={i === index} reducedMotion={reducedMotion} />
            </div>
          ))}

          <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden" aria-hidden>
            <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-gc-teal/10 blur-3xl" />
            <div className="absolute bottom-8 left-4 h-48 w-48 rounded-full bg-gc-coral/10 blur-3xl" />
            <div className="absolute right-1/3 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-gc-teal/6 blur-2xl" />
          </div>

          <GastroSection className="relative z-[3] flex min-h-[inherit] items-center py-10 sm:py-14 lg:py-16">
            <GastroContainer className="w-full">
              <div key={slide.id} className={cn('min-w-0 max-w-[700px]', !reducedMotion && 'gc-slide-up')}>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gc-teal/35 bg-gc-teal/12 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-gc-teal">
                  <span className="h-1.5 w-1.5 rounded-full bg-gc-teal" aria-hidden />
                  {slide.badge}
                </span>

                <h2 className="mt-5 text-[2.1rem] font-extrabold leading-[1.08] tracking-tight text-white sm:text-[2.75rem] lg:text-[3.4rem]">
                  {slide.title}
                </h2>

                <p className="mt-5 max-w-xl text-[15px] leading-[1.7] text-white/72 sm:text-[17px] lg:text-lg">
                  {slide.subtitle}
                </p>

                <div className="mt-9 flex min-w-0 flex-col gap-3.5 sm:flex-row sm:flex-wrap">
                  {renderPrimaryCta()}
                  {slide.secondaryCta && slide.secondaryHref ? (
                    <GastroButton href={slide.secondaryHref} variant="secondary" size="lg" className="w-full sm:w-auto">
                      {slide.secondaryCta}
                    </GastroButton>
                  ) : null}
                </div>
              </div>
            </GastroContainer>
          </GastroSection>

          <button
            type="button"
            onClick={prev}
            className="absolute left-[max(1rem,env(safe-area-inset-left))] top-1/2 z-[4] hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-gc-navy/60 text-white shadow-[0_4px_16px_rgba(0,0,0,0.30)] backdrop-blur-sm transition-all duration-200 hover:border-white/50 hover:bg-white/15 hover:shadow-[0_6px_24px_rgba(0,0,0,0.35)] active:scale-95 sm:flex"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={next}
            className="absolute right-[max(1rem,env(safe-area-inset-right))] top-1/2 z-[4] hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-gc-navy/60 text-white shadow-[0_4px_16px_rgba(0,0,0,0.30)] backdrop-blur-sm transition-all duration-200 hover:border-white/50 hover:bg-white/15 hover:shadow-[0_6px_24px_rgba(0,0,0,0.35)] active:scale-95 sm:flex"
            aria-label="Próximo slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-7 left-1/2 z-[4] flex -translate-x-1/2 items-center gap-2">
            {heroSlides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(i)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  i === index
                    ? 'w-8 bg-gc-coral shadow-[0_2px_8px_rgba(255,107,53,0.55)]'
                    : 'w-2 bg-white/35 hover:bg-white/60',
                )}
                aria-label={`Ir para slide ${i + 1}: ${s.title}`}
                aria-current={i === index ? 'true' : undefined}
              />
            ))}
          </div>
        </div>
      </section>

      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-4xl gap-0 overflow-hidden border-0 p-0 sm:max-w-4xl" closeButtonClassName="text-white hover:text-white/80">
          <DialogTitle className="sr-only">Vídeo de apresentação do curso</DialogTitle>
          {GASTRO_INTRO_VIDEO_URL ? (
            <div className="relative mx-auto w-full max-w-[420px] bg-gc-navy">
              <div className="relative aspect-[9/16] w-full max-h-[min(85vh,720px)] sm:max-h-[min(85vh,780px)]">
                <iframe
                  src={GASTRO_INTRO_VIDEO_URL}
                  title="Apresentação do curso Fellowship em Endoscopia Digestiva Alta"
                  className="absolute inset-0 h-full w-full border-0"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  allowFullScreen
                  scrolling="no"
                />
              </div>
            </div>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center bg-gc-navy px-8 text-center">
              <p className="text-sm leading-relaxed text-white/70 sm:text-base">
                O vídeo de apresentação do curso será disponibilizado em breve.
                <span className="mt-2 block text-xs text-white/45">
                  Configure a URL em <code className="text-gc-teal">GASTRO_INTRO_VIDEO_URL</code>.
                </span>
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
