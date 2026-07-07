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

const SPECIALIST_SLIDE = 'w-[min(68vw,230px)] shrink-0 snap-start sm:w-[250px]';

function SpecialistCard({ person }: { person: (typeof specialists)[number] }) {
  const hasLinkedIn = Boolean(person.linkedinUrl);
  const cardContent = (
    <GastroCard
      hover={hasLinkedIn}
      className={cn(
        'group/spec flex h-full min-w-0 flex-col items-center overflow-hidden !p-0 text-center',
        'border border-gc-border/60 shadow-[var(--gc-shadow-card)]',
        hasLinkedIn && 'cursor-pointer hover:border-gc-teal/35',
      )}
    >
      {person.photoSrc ? (
        <div className="w-full px-2.5 pt-2.5">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-gc-text/25 shadow-[0_6px_24px_rgba(8,42,79,0.18)]">
            <img
              src={person.photoSrc}
              alt={person.name}
              loading="lazy"
              className="h-full w-full object-cover object-top transition-transform duration-500 group-hover/spec:scale-[1.03] motion-reduce:group-hover/spec:scale-100"
            />
          </div>
        </div>
      ) : (
        <div className="w-full px-2.5 pt-2.5">
          <span
            className="flex aspect-square w-full items-center justify-center rounded-2xl border-2 border-gc-text/25 text-xl font-bold text-white shadow-[0_6px_24px_rgba(8,42,79,0.18)]"
            style={{ backgroundColor: person.color }}
            aria-hidden
          >
            {person.initials}
          </span>
        </div>
      )}
      <div className="flex w-full flex-col items-center px-4 py-4 text-center sm:px-5 sm:py-4">
        <h3 className="text-sm font-bold leading-snug text-gc-text sm:text-[15px]">{person.name}</h3>
        {person.registration ? (
          <p className="mt-1.5 text-[11px] text-gc-gray-text sm:text-xs">{person.registration}</p>
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
