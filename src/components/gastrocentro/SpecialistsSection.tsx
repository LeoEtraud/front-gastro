import {
  GC_SECTION_Y,
  GastroCard,
  GastroContainer,
  GastroSection,
  SectionHeader,
} from '@/components/gastrocentro/GastroLayout';
import { GastroHorizontalCarousel } from '@/components/gastrocentro/GastroHorizontalCarousel';
import { specialists } from '@/data/gastrocentro-landing';
import { cn } from '@/lib/utils';

const SPECIALIST_SLIDE = 'w-[min(72vw,260px)] shrink-0 snap-start sm:w-[280px]';

function SpecialistCard({ person }: { person: (typeof specialists)[number] }) {
  const hasLinkedIn = Boolean(person.linkedinUrl);
  const cardContent = (
    <GastroCard
      hover={hasLinkedIn}
      className={cn(
        'group/spec flex h-full min-w-0 flex-col items-center !p-0 text-center',
        'border border-gc-border/60 shadow-[var(--gc-shadow-card)]',
        hasLinkedIn && 'cursor-pointer hover:border-gc-teal/35',
      )}
    >
      <div className="flex w-full flex-col items-center px-6 py-8 sm:px-7 sm:py-9">
        {person.photoSrc ? (
          <div className="relative overflow-hidden rounded-full ring-2 ring-gc-border ring-offset-2 ring-offset-white transition-all duration-300 group-hover/spec:ring-gc-teal/50">
            <img
              src={person.photoSrc}
              alt={person.name}
              loading="lazy"
              className="h-28 w-28 rounded-full object-cover transition-transform duration-500 group-hover/spec:scale-[1.04] motion-reduce:group-hover/spec:scale-100 sm:h-32 sm:w-32"
            />
          </div>
        ) : (
          <span
            className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-transform duration-200 group-hover/spec:scale-105 sm:h-32 sm:w-32 sm:text-2xl"
            style={{ backgroundColor: person.color }}
            aria-hidden
          >
            {person.initials}
          </span>
        )}
        <h3 className="mt-5 text-[15px] font-bold leading-snug text-gc-text sm:text-base">{person.name}</h3>
        <p className="mt-1.5 text-xs font-semibold text-gc-teal">{person.specialty}</p>
        {person.registration ? (
          <p className="mt-1.5 text-[11px] text-gc-gray-text">{person.registration}</p>
        ) : null}
      </div>
    </GastroCard>
  );

  if (hasLinkedIn) {
    return (
      <a
        href={person.linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full min-w-0"
        aria-label={`Ver perfil de ${person.name} no LinkedIn`}
      >
        {cardContent}
      </a>
    );
  }

  return <div className="h-full min-w-0">{cardContent}</div>;
}

export function SpecialistsSection() {
  return (
    <GastroSection id="especialistas" className={cn('bg-white', GC_SECTION_Y)}>
      <GastroContainer>
        <SectionHeader
          title="Aprenda com médicos de referência"
          subtitle="Corpo docente altamente qualificado e com ampla experiência clínica."
        />

        <div className="relative overflow-visible">
          <GastroHorizontalCarousel
            slideCount={specialists.length}
            showIndicators={false}
            aria-label="Carrossel do corpo docente"
          >
            {specialists.map((person) => (
              <div key={person.id} data-carousel-slide className={SPECIALIST_SLIDE}>
                <SpecialistCard person={person} />
              </div>
            ))}
          </GastroHorizontalCarousel>
        </div>
      </GastroContainer>
    </GastroSection>
  );
}
