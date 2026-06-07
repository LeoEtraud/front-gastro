import {
  GC_GRID_TESTIMONIALS,
  GC_SECTION_Y,
  GastroContainer,
  GastroSection,
  SectionHeader,
} from '@/components/gastrocentro/GastroLayout';
import { testimonials } from '@/data/gastrocentro-landing';
import { cn } from '@/lib/utils';

const PLACEHOLDER_QUOTE =
  'Depoimentos de alunos e médicos serão publicados em breve. Esta área está preparada para receber experiências com a GastroCentro.';
const PLACEHOLDER_NAME = 'Em breve';
const PLACEHOLDER_ROLE = 'Aluno / Profissional de saúde';

export function TestimonialsSection() {
  return (
    <GastroSection
      id="depoimentos"
      className={cn('relative overflow-hidden bg-gc-navy pb-16 sm:pb-20', GC_SECTION_Y)}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-gc-teal/7 blur-[80px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-gc-coral/7 blur-[80px]" />
        <div className="absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 rounded-full bg-gc-teal/4 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <GastroContainer className="relative z-10">
        <SectionHeader
          title="Experiências de quem já conhece a GastroCentro"
          subtitle="Espaço reservado para depoimentos de alunos e profissionais de saúde."
          dark
        />

        <div className={cn(GC_GRID_TESTIMONIALS, 'mt-10')}>
          {testimonials.map((item) => {
            const isPlaceholder = item.placeholder || !item.quote;
            const quote = isPlaceholder ? PLACEHOLDER_QUOTE : item.quote;
            const name = isPlaceholder ? PLACEHOLDER_NAME : item.name;
            const role = isPlaceholder ? PLACEHOLDER_ROLE : item.role;
            const initials = isPlaceholder ? '…' : item.initials;

            return (
              <article
                key={item.id}
                className="flex min-h-full min-w-0 flex-col rounded-[22px] border border-white/10 bg-white/[0.07] p-7 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.10] sm:p-8"
              >
                <header className="flex flex-col items-center text-center">
                  <span
                    className={cn(
                      'flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-1 sm:h-16 sm:w-16 sm:text-base',
                      isPlaceholder
                        ? 'bg-white/10 text-white/45 ring-white/15'
                        : 'bg-gc-teal/25 text-gc-teal ring-gc-teal/30',
                    )}
                  >
                    {initials}
                  </span>
                  <p className="mt-4 text-[14px] font-semibold text-white sm:text-[15px]">{name}</p>
                  <p className="mt-1 text-xs text-white/50">{role}</p>
                </header>

                <blockquote
                  className={cn(
                    'mt-6 flex-1 border-t border-white/10 pt-6 text-center text-[14px] leading-[1.75] sm:text-[15px]',
                    isPlaceholder ? 'text-white/45 italic' : 'text-white/82',
                  )}
                >
                  {isPlaceholder ? quote : `\u201C${quote}\u201D`}
                </blockquote>
              </article>
            );
          })}
        </div>
      </GastroContainer>
    </GastroSection>
  );
}
