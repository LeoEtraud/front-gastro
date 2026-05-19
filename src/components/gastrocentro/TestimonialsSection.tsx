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
      className={cn('relative overflow-hidden bg-gc-navy pb-14 sm:pb-16', GC_SECTION_Y)}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-gc-teal/8 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-gc-coral/8 blur-3xl" />
      </div>

      <GastroContainer className="relative z-10">
        <SectionHeader
          title="O que nossos alunos dizem"
          subtitle="Histórias reais de quem já transformou conhecimento em prática."
          viewAllHref="#depoimentos"
          viewAllLabel="Ver depoimentos"
          dark
        />

        <div className={cn(GC_GRID_TESTIMONIALS, 'mt-8')}>
          {testimonials.map((item) => (
            <article
              key={item.id}
              className="flex min-h-full min-w-0 flex-col rounded-[18px] border border-white/8 bg-[#0a2d52]/60 p-6 backdrop-blur-sm sm:p-7"
            >
              <Quote className="h-8 w-8 shrink-0 text-gc-teal/50" aria-hidden />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-white/85 sm:text-[15px]">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <footer className="mt-6 flex min-w-0 items-center gap-3 border-t border-white/8 pt-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gc-teal/20 text-xs font-bold text-gc-teal">
                  {item.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                  <p className="truncate text-xs text-white/55">{item.role}</p>
                </div>
              </footer>
            </article>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {testimonials.map((t, i) => (
            <span
              key={t.id}
              className={`h-2 rounded-full ${i === 0 ? 'w-6 bg-gc-coral' : 'w-2 bg-white/25'}`}
              aria-hidden
            />
          ))}
        </div>
      </GastroContainer>
    </GastroSection>
  );
}
