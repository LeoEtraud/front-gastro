import { useState } from 'react';
import { usePublicCourses } from '@/hooks/use-courses';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Clock3, GraduationCap, BookOpen, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useDelayedFlag } from '@/hooks/use-delayed-flag';
import { CourseCardGridSkeleton } from '@/components/ui/content-skeletons';
import { normalizePtBrText } from '@/lib/normalize-ptbr';

const specialties = ['Cardiologia', 'Neurologia', 'Pediatria', 'Cirurgia', 'Clínica Médica'];
const levelLabel: Record<string, string> = {
  BASIC: 'Básico',
  BEGINNER: 'Básico',
  INTERMEDIATE: 'Intermediário',
  ADVANCED: 'Avançado',
};

function formatCourseLevel(level?: string) {
  if (!level) return '';

  const normalized = level.trim().toUpperCase();
  const translated = levelLabel[normalized];
  if (translated) return translated;

  const lower = level.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export default function CourseCatalog() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim(), 350);

  const { data, isLoading } = usePublicCourses({ search: debouncedSearch, specialty });
  const showLoading = useDelayedFlag(isLoading);

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
      return;
    }
    navigate('/student/dashboard');
  };

  return (
    <div className="min-h-dvh overflow-x-hidden bg-slate-50">
      <div className="bg-sidebar py-12 text-white sm:py-14 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mb-3 h-8 w-8 rounded-full bg-slate-700 text-white hover:bg-slate-800 sm:mb-4"
            onClick={handleGoBack}
            aria-label="Voltar"
            title="Voltar"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <h1 className="mb-3 font-display text-2xl font-bold text-white sm:mb-4 sm:text-3xl md:text-4xl">
            Catálogo de Cursos
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base md:text-lg">
            Encontre a especialização ideal para sua carreira médica. Filtre por especialidade ou busque diretamente.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 md:flex-row md:gap-6">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden />
            <Input
              placeholder="Buscar cursos..."
              className="bg-white pl-10 sm:h-12"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="h-11 min-h-11 w-full shrink-0 rounded-md border border-slate-200 bg-white px-4 text-base md:h-12 md:w-64 md:text-sm touch-manipulation"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          >
            <option value="">Todas Especialidades</option>
            {specialties.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {isLoading && showLoading ? (
          <CourseCardGridSkeleton />
        ) : isLoading ? (
          <CourseCardGridSkeleton count={2} />
        ) : data?.courses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed">
            <GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">Nenhum curso encontrado</h3>
            <p className="text-slate-500">Tente ajustar seus filtros de busca.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data?.courses.map(course => (
              <Card
                key={course.id}
                className="group flex flex-col overflow-hidden border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-muted">
                  <div className="absolute inset-0 flex h-full w-full items-center justify-center text-muted-foreground">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  {course.coverImageUrl ? (
                    <img
                      src={course.coverImageUrl}
                      alt={normalizePtBrText(course.title)}
                      loading="lazy"
                      decoding="async"
                      className="relative z-[1] h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                  <Badge className="absolute top-3 right-3 z-[2] bg-white/90 text-primary uppercase tracking-wide hover:bg-white">
                    {formatCourseLevel(course.level)}
                  </Badge>
                </div>

                <CardContent className="flex flex-col gap-1.5 p-2.5 sm:gap-2 sm:p-3">
                  <span className="line-clamp-1 text-[10px] font-semibold uppercase tracking-wide text-primary sm:text-[11px]">
                    {course.specialty || 'Geral'}
                  </span>
                  <h3 className="line-clamp-1 text-sm font-bold text-card-foreground sm:text-base">
                    {normalizePtBrText(course.title)}
                  </h3>
                  <p className="line-clamp-1 text-xs text-muted-foreground sm:text-sm">
                    {normalizePtBrText(course.shortDescription || course.subtitle)}
                  </p>

                  <div className="flex items-center justify-between border-t border-border/70 pt-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5" />
                      {course.workloadHours ? `${course.workloadHours}h` : '--'}
                    </div>
                    <Link to={`/courses/${course.id}`}>
                      <Button size="sm" className="gap-1 text-xs">
                        + Informações
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
