import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  GC_GRID_LARGE,
  GC_MEDIA_CARD,
  GC_SECTION_Y,
  GastroContainer,
  GastroSection,
  SectionHeader,
} from '@/components/gastrocentro/GastroLayout';
import { featuredCourses } from '@/data/gastrocentro-landing';
import { cn } from '@/lib/utils';

export function FeaturedCoursesSection() {
  return (
    <GastroSection id="cursos-destaque" className={cn('bg-gc-ice', GC_SECTION_Y)}>
      <GastroContainer>
        <SectionHeader
          title="Cursos em destaque"
          subtitle="Conteúdos mais acessados e recomendados pelos especialistas."
          viewAllHref="/login"
        />

        <div className={cn(GC_GRID_LARGE, 'mt-8')}>
          {featuredCourses.map((course) => (
            <Link
              key={course.id}
              to="/login"
              className={GC_MEDIA_CARD}
            >
              <img
                src={course.imageSrc}
                alt={`Curso ${course.title}`}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gc-navy via-gc-navy/50 to-gc-navy/15" />

              {course.badge && (
                <span className="absolute left-4 top-4 rounded-full bg-gc-coral px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  {course.badge}
                </span>
              )}

              <div
                className={cn(
                  'absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-gc-text shadow-lg transition group-hover:scale-105',
                  course.badge ? 'top-14' : 'top-4',
                )}
              >
                <Play className="ml-0.5 h-4 w-4 fill-gc-text" aria-hidden />
              </div>

              <div className="absolute inset-x-0 bottom-0 min-w-0 p-4 sm:p-5">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gc-teal">{course.category}</span>
                <h3 className="mt-1 text-base font-bold leading-snug text-white">{course.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </GastroContainer>
    </GastroSection>
  );
}
