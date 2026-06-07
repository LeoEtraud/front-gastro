import { CheckCircle2 } from 'lucide-react';
import { GastroButton } from '@/components/gastrocentro/GastroButton';
import {
  GC_SECTION_Y,
  GastroCard,
  GastroContainer,
  GastroSection,
  SectionHeader,
} from '@/components/gastrocentro/GastroLayout';
import { platformCourse } from '@/data/gastrocentro-landing';
import { cn } from '@/lib/utils';

export function FeaturedCoursesSection() {
  const course = platformCourse;

  return (
    <GastroSection id="cursos-destaque" className={cn('bg-gc-ice', GC_SECTION_Y)}>
      <GastroContainer>
        <SectionHeader
          title="Fellowship em Endoscopia Digestiva Alta"
          subtitle="Formação completa em endoscopia digestiva alta, disponível na Plataforma GastroCentro."
        />

        <GastroCard className="mt-8 overflow-hidden !p-0 sm:mt-10">
          <div className="grid min-w-0 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-center">
            <figure className="m-0 flex w-full items-center justify-center overflow-hidden">
              <img
                src={course.imageSrc}
                alt={`Capa do curso ${course.title}`}
                loading="lazy"
                className="block h-auto w-full max-w-full object-contain"
              />
            </figure>

            <div className="flex min-w-0 flex-col justify-center p-5 sm:p-6 lg:p-7 xl:p-8">
              <span className="inline-flex w-fit items-center rounded-full bg-gc-teal/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gc-teal">
                Curso principal
              </span>

              <p className="mt-3 text-[13px] leading-relaxed text-gc-gray-text sm:text-[14px]">
                {course.description}
              </p>

              <div className="mt-4">
                <p className="text-[12px] font-bold uppercase tracking-wide text-gc-text/70">Público-alvo</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-gc-gray-text sm:text-[14px]">{course.targetAudience}</p>
              </div>

              <div className="mt-4">
                <p className="text-[12px] font-bold uppercase tracking-wide text-gc-text/70">Principais temas</p>
                <ul className="mt-2 space-y-1.5">
                  {course.topics.map((topic) => (
                    <li key={topic} className="flex items-start gap-2 text-[13px] leading-snug text-gc-gray-text sm:text-[14px]">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gc-teal" aria-hidden />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5">
                <GastroButton href="/login" variant="primary" size="lg" className="w-full sm:w-auto">
                  Acessar plataforma
                </GastroButton>
              </div>
            </div>
          </div>
        </GastroCard>
      </GastroContainer>
    </GastroSection>
  );
}
