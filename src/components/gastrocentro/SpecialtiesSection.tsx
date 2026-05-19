import { Link } from 'react-router-dom';
import {
  GC_GRID_COMPACT,
  GastroContainer,
  GastroSection,
  SectionHeader,
} from '@/components/gastrocentro/GastroLayout';
import { specialties } from '@/data/gastrocentro-landing';
import { cn } from '@/lib/utils';

export function SpecialtiesSection() {
  return (
    <GastroSection id="especialidades" className="bg-white py-16 sm:py-20 lg:py-24">
      <GastroContainer>
        <SectionHeader
          title="Explore por especialidades"
          subtitle="Encontre conteúdos organizados por áreas da gastroenterologia."
          viewAllHref="/login"
        />

        <div className={cn(GC_GRID_COMPACT, 'mt-8')}>
          {specialties.map((spec) => (
            <Link
              key={spec.id}
              to="/login"
              className="group relative min-h-[280px] min-w-0 overflow-hidden rounded-[18px] shadow-[0_4px_20px_-4px_rgba(4,27,58,0.2)] transition duration-300 hover:-translate-y-0.5"
            >
              <img
                src={spec.imageSrc}
                alt={`Especialidade ${spec.name}`}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gc-navy via-gc-navy/55 to-gc-navy/20" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <h3 className="text-base font-bold text-white sm:text-lg">{spec.name}</h3>
                <p className="mt-1 text-xs text-white/70 sm:text-sm">{spec.count} conteúdos</p>
              </div>
            </Link>
          ))}
        </div>
      </GastroContainer>
    </GastroSection>
  );
}
