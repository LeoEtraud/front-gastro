import { Link } from 'react-router-dom';
import {
  GC_MEDIA_CARD,
  GC_SECTION_Y,
  GastroContainer,
  GastroSection,
  SectionHeader,
} from '@/components/gastrocentro/GastroLayout';
import {
  GC_MEDIA_CARD_SLIDE,
  GastroHorizontalCarousel,
} from '@/components/gastrocentro/GastroHorizontalCarousel';
import { specialties } from '@/data/gastrocentro-landing';
import { cn } from '@/lib/utils';

export function SpecialtiesSection() {
  return (
    <GastroSection id="especialidades" className={cn('bg-white', GC_SECTION_Y)}>
      <GastroContainer>
        <SectionHeader
          title="Explore por especialidades"
          subtitle="Encontre conteúdos organizados por áreas da gastroenterologia."
          viewAllHref="/login"
        />

        <div className="relative overflow-visible">
          <GastroHorizontalCarousel
            slideCount={specialties.length}
            aria-label="Carrossel de especialidades"
          >
          {specialties.map((spec) => (
            <div key={spec.id} data-carousel-slide className={GC_MEDIA_CARD_SLIDE}>
              <Link to="/login" className={cn(GC_MEDIA_CARD, 'block h-full w-full')}>
                <img
                  src={spec.imageSrc}
                  alt={`Especialidade ${spec.name}`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gc-navy via-gc-navy/55 to-gc-navy/20" />
                <div className="absolute inset-x-0 bottom-0 min-w-0 p-4 sm:p-5">
                  <h3 className="text-base font-bold text-white sm:text-lg">{spec.name}</h3>
                  <p className="mt-1 text-xs text-white/70 sm:text-sm">{spec.count} conteúdos</p>
                </div>
              </Link>
            </div>
          ))}
          </GastroHorizontalCarousel>
        </div>
      </GastroContainer>
    </GastroSection>
  );
}
