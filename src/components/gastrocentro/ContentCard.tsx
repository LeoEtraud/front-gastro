import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ContentCardProps = {
  title: string;
  subtitle: string;
  category: string;
  imageSrc: string;
  href: string;
  className?: string;
};

function isInternalAppPath(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//');
}

export function ContentCard({ title, subtitle, category, imageSrc, href, className }: ContentCardProps) {
  const label = `${title} — assistir vídeo`;
  const sharedClassName = cn(
    'group relative flex aspect-[3/4] w-[min(84vw,18.5rem)] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-cyan-950/10 bg-cyan-950 shadow-md sm:w-[min(68vw,21.5rem)] md:w-[min(56vw,23.5rem)] lg:w-[min(48vw,25.5rem)] xl:w-[min(42vw,27rem)]',
    'transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-900/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50',
    className,
  );

  const body = (
    <>
      <img
        src={imageSrc}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-cyan-950/95 via-cyan-950/55 to-cyan-900/25 transition-opacity duration-300 group-hover:from-cyan-950 group-hover:via-cyan-950/70"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center bg-cyan-950/0 transition-colors duration-300 group-hover:bg-black/25"
        aria-hidden
      >
        <span
          className={cn(
            'inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-cyan-900 shadow-xl ring-2 ring-white/40',
            'scale-90 opacity-0 transition-all duration-300 ease-out',
            'group-hover:scale-100 group-hover:opacity-100',
            'motion-reduce:transition-none motion-reduce:group-hover:scale-95',
          )}
        >
          <Play className="ml-1 h-8 w-8 fill-cyan-900 text-cyan-900" stroke="none" aria-hidden />
        </span>
      </div>
      <div className="relative z-[6] mt-auto flex flex-col gap-1.5 p-4 sm:p-5">
        <span className="inline-flex w-fit rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-50 backdrop-blur-sm sm:text-[11px]">
          {category}
        </span>
        <h3 className="font-display text-base font-bold leading-tight text-white sm:text-lg">{title}</h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-cyan-50/90 sm:text-sm">{subtitle}</p>
      </div>
    </>
  );

  if (isInternalAppPath(href)) {
    return (
      <Link to={href} aria-label={label} className={sharedClassName}>
        {body}
      </Link>
    );
  }

  return (
    <a href={href} aria-label={label} className={sharedClassName}>
      {body}
    </a>
  );
}
