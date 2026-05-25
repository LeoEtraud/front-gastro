import { Heart, Layers, Play, Users } from 'lucide-react';
import { GastroContainer, GastroSection } from '@/components/gastrocentro/GastroLayout';
import { stats } from '@/data/gastrocentro-landing';
import { cn } from '@/lib/utils';

const iconMap = {
  users: Users,
  play: Play,
  layers: Layers,
  heart: Heart,
};

const colorMap = {
  users: 'bg-[#fff3ee] text-gc-coral',
  play:  'bg-[#e4f9f9] text-gc-teal',
  layers:'bg-[#e4f9f9] text-gc-teal',
  heart: 'bg-[#fff3ee] text-gc-coral',
};

export function StatsBar() {
  return (
    <GastroSection className="relative z-20 -mt-10 sm:-mt-12" aria-label="Métricas da plataforma">
      <GastroContainer>
        <div className="overflow-hidden rounded-[24px] border border-gc-border/80 bg-white shadow-[0_12px_48px_-8px_rgba(4,27,58,0.18),0_2px_8px_rgba(4,27,58,0.06)]">
          <div className="grid grid-cols-2 divide-gc-border/70 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:[&>*:nth-child(-n+2)]:border-b lg:[&>*:nth-child(-n+2)]:border-gc-border/70 [&>*:nth-child(odd)]:border-r [&>*:nth-child(odd)]:border-gc-border/70 lg:[&>*]:border-r-0 lg:[&>*:not(:last-child)]:border-r lg:[&>*:not(:last-child)]:border-gc-border/70 lg:[&>*:nth-child(-n+2)]:border-b-0">
            {stats.map((stat) => {
              const Icon = iconMap[stat.icon];
              const colors = colorMap[stat.icon];
              return (
                <div
                  key={stat.id}
                  className="flex min-w-0 items-center gap-3.5 px-5 py-6 sm:px-6 sm:py-7 lg:gap-4 lg:px-7"
                >
                  <span
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
                      colors,
                    )}
                  >
                    <Icon className="h-[22px] w-[22px]" strokeWidth={2} aria-hidden />
                  </span>
                  <div className="min-w-0 text-left">
                    <p className="text-[1.55rem] font-extrabold leading-none tracking-tight text-gc-text sm:text-[1.75rem]">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[12px] leading-snug text-gc-gray-text sm:text-[13px]">
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </GastroContainer>
    </GastroSection>
  );
}
