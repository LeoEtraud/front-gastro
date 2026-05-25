import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/** Padding lateral responsivo da seção — conteúdo interno usa gc-container. */
export const GC_SECTION = 'gc-section w-full min-w-0';

/** Espaçamento vertical padrão entre seções da landing — mais generoso para respiração. */
export const GC_SECTION_Y = 'py-14 sm:py-18 lg:py-24';

/** Card de mídia em destaque (especialidades e cursos) — altura e proporção unificadas. */
export const GC_MEDIA_CARD =
  'group relative min-h-[360px] min-w-0 overflow-hidden rounded-[22px] shadow-[var(--gc-shadow-md)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-10px_rgba(4,27,58,0.30)] sm:min-h-[400px]';

/** Compensa header fixo ao navegar por âncoras (scroll-margin + scrollIntoView). */
export const GC_SCROLL_ANCHOR = 'scroll-mt-[100px]';

/** Container centralizado: min(100%, 1280px) com margem automática. */
export const GC_CONTAINER = 'gc-container min-w-0';

/** Grid fluido para cards médios (Comece por aqui, Especialistas). */
export const GC_GRID = 'gc-grid';

/** Grid fluido para cards compactos (Especialidades). */
export const GC_GRID_COMPACT = 'gc-grid-compact';

/** Grid fluido para cards grandes (Cursos em destaque). */
export const GC_GRID_LARGE = 'gc-grid-large';

/** Grid fluido para depoimentos. */
export const GC_GRID_TESTIMONIALS = 'gc-grid-testimonials';

/** Hero em duas colunas no desktop. */
export const GC_HERO_GRID = 'gc-hero-grid';

type GastroSectionProps = {
  children: React.ReactNode;
  className?: string;
  as?: 'section' | 'div' | 'header' | 'footer';
  id?: string;
};

export function GastroSection({ children, className, as: Tag = 'section', id }: GastroSectionProps) {
  return (
    <Tag id={id} className={cn(GC_SECTION, id && GC_SCROLL_ANCHOR, className)}>
      {children}
    </Tag>
  );
}

type GastroContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section';
  id?: string;
};

export function GastroContainer({ children, className, as: Tag = 'div', id }: GastroContainerProps) {
  return (
    <Tag id={id} className={cn(GC_CONTAINER, className)}>
      {children}
    </Tag>
  );
}

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  dark?: boolean;
  className?: string;
};

export function SectionHeader({
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = 'Ver todos',
  dark = false,
  className,
}: SectionHeaderProps) {
  const link = viewAllHref ? (
    viewAllHref.startsWith('/') ? (
      <Link
        to={viewAllHref}
        className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-gc-coral transition hover:text-gc-coral/80"
      >
        {viewAllLabel}
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
      </Link>
    ) : (
      <a
        href={viewAllHref}
        className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-gc-coral transition hover:text-gc-coral/80"
      >
        {viewAllLabel}
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
      </a>
    )
  ) : null;

  return (
    <div className={cn('flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0 max-w-2xl">
        <h2
          className={cn(
            'text-[1.75rem] font-extrabold leading-tight tracking-tight sm:text-[2rem] lg:text-[2.25rem]',
            dark ? 'text-white' : 'text-gc-text',
          )}
        >
          {title}
        </h2>
        {subtitle ? (
          <p className={cn('mt-3 text-[15px] leading-relaxed sm:text-base lg:text-[17px]', dark ? 'text-white/65' : 'text-gc-gray-text')}>
            {subtitle}
          </p>
        ) : null}
      </div>
      {link}
    </div>
  );
}

export function GastroCard({
  children,
  className,
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        'gc-card rounded-[22px] border border-gc-border bg-white shadow-[var(--gc-shadow-card)]',
        hover && 'hover:-translate-y-1 hover:border-gc-teal/25 hover:shadow-[var(--gc-shadow-lg)]',
        className,
      )}
    >
      {children}
    </div>
  );
}
