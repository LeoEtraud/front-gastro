import { FileText, Route, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  GC_SECTION_Y,
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
};

const iconColors = [
  'bg-[#e4f9f9] text-gc-teal',
  'bg-[#fff3ee] text-gc-coral',
  'bg-[#fffbeb] text-[#d4940e]',
];

function CardLink({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block min-w-0 h-full">
        {children}
      </a>
    );
  }
  if (href.startsWith('#')) {
    return (
      <a href={href} className="block min-w-0 h-full">
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className="block min-w-0 h-full">
      {children}
    </Link>
  );
}

export function StartHereSection() {
  return (
    <GastroSection id="comece-aqui" className={cn('bg-gc-ice', GC_SECTION_Y)}>
      <GastroContainer className="w-full">
        <SectionHeader
          title="Comece por aqui"
          subtitle="Orientações para iniciar sua jornada na Plataforma GastroCentro."
        />
        <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
          {startHereCards.map((card, i) => {
            const Icon = iconMap[card.icon];
            return (
              <CardLink key={card.id} href={card.href} external={card.external}>
                <GastroCard className="group/card flex h-full flex-col !p-0">
                  <div className="flex h-full flex-col p-7 sm:p-8">
                    <span
                      className={cn(
                        'inline-flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover/card:scale-110',
                        iconColors[i % iconColors.length],
                      )}
                    >
                      <Icon className="h-[22px] w-[22px]" strokeWidth={2} aria-hidden />
                    </span>
                    <h3 className="mt-5 text-[15px] font-bold leading-snug text-gc-text sm:text-base">
                      {card.title}
                    </h3>
                    <p className="mt-2.5 flex-1 text-[13px] leading-relaxed text-gc-gray-text sm:text-sm">
                      {card.description}
                    </p>
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
