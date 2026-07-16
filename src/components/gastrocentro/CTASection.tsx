import { GastroButton } from '@/components/gastrocentro/GastroButton';
import { GC_SECTION_Y, GastroContainer, GastroSection } from '@/components/gastrocentro/GastroLayout';
import { cn } from '@/lib/utils';

export function CTASection() {
  return (
    <GastroSection className={cn('bg-gc-ice', GC_SECTION_Y)}>
      <GastroContainer>
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-gc-navy via-[#072244] to-gc-mid px-8 py-14 shadow-[0_16px_64px_-12px_rgba(4,27,58,0.45)] sm:px-12 sm:py-16 lg:px-16 lg:py-20">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <div className="absolute -right-20 -top-8 h-72 w-72 rounded-full bg-gc-teal/14 blur-[80px]" />
            <div className="absolute -bottom-8 left-0 h-56 w-56 rounded-full bg-gc-coral/10 blur-[70px]" />
            <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gc-teal/5 blur-2xl" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>

          <div className="relative grid min-w-0 grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-14">
            <div className="min-w-0">
              <h2 className="text-[1.75rem] font-extrabold leading-[1.12] tracking-tight text-white sm:text-[2.1rem] lg:text-[2.5rem]">
                Aprofunde seus conhecimentos e transforme sua prática clínica.
              </h2>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/65 sm:text-base lg:text-[17px]">
                Inscreva-se na plataforma e tenha acesso aos conteúdos, aulas e materiais disponíveis para sua formação.
              </p>
            </div>
            <div className="flex min-w-0 flex-col gap-3.5 sm:flex-row lg:flex-col lg:items-stretch lg:min-w-[220px]">
              <GastroButton href="/login" variant="primary" size="lg" className="w-full text-center">
                Entrar na plataforma
              </GastroButton>
            </div>
          </div>
        </div>
      </GastroContainer>
    </GastroSection>
  );
}
