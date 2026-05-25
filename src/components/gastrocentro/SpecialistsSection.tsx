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
const SPECIALIST_SLIDE = 'w-[min(58vw,200px)] shrink-0 snap-start';

function SpecialistCard({ person }: { person: typeof specialists[number] }) {
  return (
    <GastroCard className="flex h-full min-w-0 flex-col items-center !p-0 text-center">
      <div className="flex w-full flex-col items-center p-5 sm:p-7">
        {person.photoSrc ? (
          <img
            src={person.photoSrc}
            alt={person.name}
            loading="lazy"
            className="h-20 w-20 shrink-0 rounded-full object-cover ring-2 ring-gc-border"
          />
        ) : (
          <span
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
            style={{ backgroundColor: person.color }}
            aria-hidden
          >
            {person.initials}
          </span>
        )}
        <h3 className="mt-4 text-sm font-bold text-gc-text">{person.name}</h3>
        <p className="mt-1 text-xs text-gc-teal">{person.specialty}</p>
        <p className="mt-2 text-[11px] text-gc-gray-text">{person.registration}</p>
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
        <div className="mt-8 hidden grid-cols-2 gap-5 sm:grid lg:grid-cols-4">
          {specialists.map((person) => (
            <SpecialistCard key={person.id} person={person} />
          ))}
        </div>
      </GastroContainer>
    </GastroSection>
  );
}
