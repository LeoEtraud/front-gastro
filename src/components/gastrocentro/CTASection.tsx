import { GastroButton } from '@/components/gastrocentro/GastroButton';
import { GC_SECTION_Y, GastroContainer, GastroSection } from '@/components/gastrocentro/GastroLayout';
import { cn } from '@/lib/utils';

export function CTASection() {
  return (
    <GastroSection className={cn('bg-gc-ice', GC_SECTION_Y)}>
      <GastroContainer>
        <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-gc-navy via-gc-deep to-gc-mid px-6 py-10 shadow-[0_12px_48px_-12px_rgba(4,27,58,0.35)] sm:px-10 sm:py-12 lg:px-12">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <div className="absolute -right-16 top-0 h-56 w-56 rounded-full bg-gc-teal/15 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-gc-coral/10 blur-3xl" />
          </div>

          <div className="relative grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-12">
            <div className="min-w-0">
              <h2 className="text-2xl font-extrabold leading-snug text-white sm:text-[1.75rem] lg:text-3xl">
                Aprofunde seus conhecimentos e transforme sua prática clínica.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/65 sm:text-base">
                Assine a plataforma e tenha acesso ilimitado a todos os conteúdos.
              </p>
            </div>
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
              <GastroButton href="/login" variant="primary" size="lg" className="w-full sm:min-w-[220px] lg:w-full">
                Acessar plataforma
              </GastroButton>
              <GastroButton href="/register" variant="secondary" size="lg" className="w-full sm:min-w-[220px] lg:w-full">
                Ver planos
              </GastroButton>
            </div>
          </div>
        </div>
      </GastroContainer>
    </GastroSection>
  );
}
