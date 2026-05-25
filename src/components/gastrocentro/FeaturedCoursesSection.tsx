import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  GC_SECTION_Y,
  GastroContainer,
  GastroSection,
  SectionHeader,
} from '@/components/gastrocentro/GastroLayout';
import {
  GastroHorizontalCarousel,
} from '@/components/gastrocentro/GastroHorizontalCarousel';
import { featuredCourses } from '@/data/gastrocentro-landing';
import { cn } from '@/lib/utils';

/** Largura de cada slide de curso no mobile. */
const COURSE_SLIDE = 'w-[min(76vw,300px)] shrink-0 snap-start';

function CourseCard({ course }: { course: typeof featuredCourses[number] }) {
  return (
    <Link
      to="/login"
      className="group relative block h-full w-full min-h-[360px] overflow-hidden rounded-[22px] shadow-[var(--gc-shadow-md)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-10px_rgba(4,27,58,0.30)] sm:min-h-[400px]"
    >
      <img
        src={course.imageSrc}
        alt={`Curso ${course.title}`}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
      />
      {/* Subtle bottom-only overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-gc-navy/95 via-gc-navy/30 to-transparent" />
      {/* Very subtle top dark edge */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-gc-navy/25 to-transparent" />

      {/* Badge */}
      {course.badge && (
        <span className="absolute left-4 top-4 rounded-full bg-gc-coral px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-[0_2px_8px_rgba(255,107,53,0.45)]">
          {course.badge}
        </span>
      )}

      {/* Play button */}
      <div
        className={cn(
          'absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-gc-text shadow-[0_4px_16px_rgba(4,27,58,0.25)] transition-transform duration-200 group-hover:scale-110',
          course.badge ? 'top-14' : 'top-4',
        )}
      >
        <Play className="ml-0.5 h-4 w-4 fill-gc-text" aria-hidden />
      </div>

      {/* Text overlay */}
      <div className="absolute inset-x-0 bottom-0 min-w-0 p-5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gc-teal">
          {course.category}
        </span>
        <h3 className="mt-1.5 text-[15px] font-bold leading-snug text-white sm:text-base">
          {course.title}
        </h3>
      </div>
    </Link>
  );
}

export function FeaturedCoursesSection() {
  return (
    <GastroSection id="cursos-destaque" className={cn('bg-gc-ice', GC_SECTION_Y)}>
      <GastroContainer>
        <SectionHeader
          title="Cursos em destaque"
          subtitle="Conteúdos mais acessados e recomendados pelos especialistas."
          viewAllHref="/login"
        />

        {/* ── Mobile: carrossel ── */}
        <div className="sm:hidden">
          <GastroHorizontalCarousel
            slideCount={featuredCourses.length}
            aria-label="Carrossel de cursos em destaque"
          >
            {featuredCourses.map((course) => (
              <div
                key={course.id}
                data-carousel-slide
                className={cn(COURSE_SLIDE, 'min-h-[320px]')}
              >
                <CourseCard course={course} />
              </div>
            ))}
          </GastroHorizontalCarousel>
        </div>

        {/* ── Desktop: grid ── */}
        <div className="mt-10 hidden grid-cols-2 gap-6 sm:grid lg:grid-cols-4">
          {featuredCourses.map((course) => (
            <div key={course.id} className="min-h-[370px] sm:min-h-[410px]">
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      </GastroContainer>
    </GastroSection>
  );
}
