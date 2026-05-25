import {
  GC_SECTION_Y,
  GastroCard,
  GastroContainer,
  GastroSection,
  SectionHeader,
} from '@/components/gastrocentro/GastroLayout';
import {
  GastroHorizontalCarousel,
} from '@/components/gastrocentro/GastroHorizontalCarousel';
import { cn } from '@/lib/utils';
import { specialists } from '@/data/gastrocentro-landing';

/** Largura de cada slide de especialista no mobile. */
const SPECIALIST_SLIDE = 'w-[min(58vw,210px)] shrink-0 snap-start';

function SpecialistCard({ person }: { person: typeof specialists[number] }) {
  return (
    <GastroCard className="group/spec flex h-full min-w-0 flex-col items-center !p-0 text-center hover:border-gc-teal/30">
      <div className="flex w-full flex-col items-center px-6 py-7 sm:px-7 sm:py-8">
        {person.photoSrc ? (
          <div className="relative overflow-hidden rounded-full ring-2 ring-gc-border ring-offset-2 ring-offset-white transition-all duration-300 group-hover/spec:ring-gc-teal/50">
            <img
              src={person.photoSrc}
              alt={person.name}
              loading="lazy"
              className="h-24 w-24 rounded-full object-cover transition-transform duration-500 group-hover/spec:scale-[1.04] motion-reduce:group-hover/spec:scale-100"
            />
          </div>
        ) : (
          <span
            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-transform duration-200 group-hover/spec:scale-105"
            style={{ backgroundColor: person.color }}
            aria-hidden
          >
            {person.initials}
          </span>
        )}
        <h3 className="mt-5 text-[15px] font-bold leading-snug text-gc-text">{person.name}</h3>
        <p className="mt-1.5 text-xs font-semibold text-gc-teal">{person.specialty}</p>
        <p className="mt-1.5 text-[11px] text-gc-gray-text">{person.registration}</p>
      </div>
    </GastroCard>
  );
}

export function SpecialistsSection() {
  return (
    <GastroSection id="especialistas" className={cn('bg-white', GC_SECTION_Y)}>
      <GastroContainer>
        <SectionHeader
          title="Aprenda com especialistas de referência"
          subtitle="Corpo docente altamente qualificado e com ampla experiência clínica."
          viewAllHref="/login"
        />

        {/* ── Mobile: carrossel ── */}
        <div className="sm:hidden">
          <GastroHorizontalCarousel
            slideCount={specialists.length}
            aria-label="Carrossel do corpo docente"
          >
            {specialists.map((person) => (
              <div
                key={person.id}
                data-carousel-slide
                className={SPECIALIST_SLIDE}
              >
                <SpecialistCard person={person} />
              </div>
            ))}
          </GastroHorizontalCarousel>
        </div>

        {/* ── Desktop: grid ── */}
        <div className="mt-10 hidden grid-cols-2 gap-6 sm:grid lg:grid-cols-4">
          {specialists.map((person) => (
            <SpecialistCard key={person.id} person={person} />
          ))}
        </div>
      </GastroContainer>
    </GastroSection>
  );
}
