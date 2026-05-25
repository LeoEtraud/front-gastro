import { Quote } from 'lucide-react';
import {
  GC_GRID_TESTIMONIALS,
  GC_SECTION_Y,
  GastroContainer,
  GastroSection,
  SectionHeader,
} from '@/components/gastrocentro/GastroLayout';
import { testimonials } from '@/data/gastrocentro-landing';
import { cn } from '@/lib/utils';

export function TestimonialsSection() {
  return (
    <GastroSection
      id="depoimentos"
      className={cn('relative overflow-hidden bg-gc-navy pb-16 sm:pb-20', GC_SECTION_Y)}
    >
      {/* Background detail */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-gc-teal/7 blur-[80px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-gc-coral/7 blur-[80px]" />
        <div className="absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 rounded-full bg-gc-teal/4 blur-3xl" />
        {/* Subtle horizontal rule at top */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <GastroContainer className="relative z-10">
        <SectionHeader
          title="O que nossos alunos dizem"
          subtitle="Histórias reais de quem já transformou conhecimento em prática."
          viewAllHref="#depoimentos"
          viewAllLabel="Ver depoimentos"
          dark
        />

        <div className={cn(GC_GRID_TESTIMONIALS, 'mt-10')}>
          {testimonials.map((item) => (
            <article
              key={item.id}
              className="flex min-h-full min-w-0 flex-col rounded-[22px] border border-white/10 bg-white/[0.07] p-7 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.10] sm:p-8"
            >
              <Quote className="h-10 w-10 shrink-0 text-gc-teal/55" aria-hidden />
              <blockquote className="mt-5 flex-1 text-[14px] leading-[1.75] text-white/82 sm:text-[15px]">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <footer className="mt-7 flex min-w-0 items-center gap-3.5 border-t border-white/10 pt-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gc-teal/25 text-xs font-bold text-gc-teal ring-1 ring-gc-teal/30">
                  {item.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-white">{item.name}</p>
                  <p className="truncate text-xs text-white/50">{item.role}</p>
                </div>
              </footer>
            </article>
          ))}
        </div>
      </GastroContainer>
    </GastroSection>
  );
}
