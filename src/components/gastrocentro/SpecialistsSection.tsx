import { GastroCard, GastroContainer, GastroSection, SectionHeader } from '@/components/gastrocentro/GastroLayout';
import { specialists } from '@/data/gastrocentro-landing';

export function SpecialistsSection() {
  return (
    <GastroSection id="especialistas" className="bg-white py-16 sm:py-20 lg:py-24">
      <GastroContainer>
        <SectionHeader
          title="Aprenda com especialistas referência"
          subtitle="Corpo docente altamente qualificado e com ampla experiência clínica."
          viewAllHref="/login"
        />

        <div className="mt-8 grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
          {specialists.map((person) => (
            <GastroCard key={person.id} className="flex min-w-0 flex-col items-center !p-0 text-center">
              <div className="flex w-full flex-col items-center p-6 sm:p-7">
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
          ))}
        </div>
      </GastroContainer>
    </GastroSection>
  );
}
