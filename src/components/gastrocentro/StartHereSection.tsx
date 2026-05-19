import { CalendarDays, FileText, Route, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  GC_GRID,
  GastroCard,
  GastroContainer,
  GastroSection,
  SectionHeader,
} from '@/components/gastrocentro/GastroLayout';
import { startHereCards } from '@/data/gastrocentro-landing';
import { cn } from '@/lib/utils';

const iconMap = {
  routes: Route,
  star: Star,
  files: FileText,
  calendar: CalendarDays,
};

const iconColors = [
  'bg-[#e6fafa] text-gc-teal',
  'bg-[#fff0ea] text-gc-coral',
  'bg-[#fff8e6] text-[#d4a012]',
  'bg-[#e8eef8] text-gc-mid',
];

function CardLink({ href, children }: { href: string; children: React.ReactNode }) {
  if (href.startsWith('#')) {
    return <a href={href} className="block min-w-0">{children}</a>;
  }
  return <Link to={href} className="block min-w-0">{children}</Link>;
}

export function StartHereSection() {
  return (
    <GastroSection id="comece-aqui" className="bg-gc-ice py-16 sm:py-20 lg:py-24">
      <GastroContainer>
        <SectionHeader
          title="Comece por aqui"
          subtitle="Navegue pelos principais caminhos da plataforma."
          viewAllHref="/login"
        />
        <div className={cn(GC_GRID, 'mt-8')}>
          {startHereCards.map((card, i) => {
            const Icon = iconMap[card.icon];
            return (
              <CardLink key={card.id} href={card.href}>
                <GastroCard className="flex h-full flex-col !p-0">
                  <div className="flex h-full flex-col p-6 sm:p-7">
                    <span
                      className={cn(
                        'inline-flex h-11 w-11 items-center justify-center rounded-xl',
                        iconColors[i % iconColors.length],
                      )}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                    </span>
                    <h3 className="mt-4 text-base font-bold text-gc-text">{card.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-gc-gray-text">{card.description}</p>
                  </div>
                </GastroCard>
              </CardLink>
            );
          })}
        </div>
      </GastroContainer>
    </GastroSection>
  );
}
