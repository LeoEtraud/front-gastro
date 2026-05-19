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
  users: 'bg-[#fff0ea] text-gc-coral',
  play: 'bg-[#e6fafa] text-gc-teal',
  layers: 'bg-[#e6fafa] text-gc-teal',
  heart: 'bg-[#fff0ea] text-gc-coral',
};

export function StatsBar() {
  return (
    <GastroSection className="relative z-20 -mt-9 sm:-mt-11" aria-label="Métricas da plataforma">
      <GastroContainer>
        <div className="overflow-hidden rounded-[18px] border border-gc-border bg-white shadow-[0_8px_40px_-8px_rgba(4,27,58,0.15)]">
          <div className="grid grid-cols-1 divide-y divide-gc-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = iconMap[stat.icon];
              const colors = colorMap[stat.icon];
              return (
                <div
                  key={stat.id}
                  className="flex min-w-0 items-center gap-3 px-4 py-5 sm:px-5 sm:py-6 lg:gap-3.5"
                >
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11',
                      colors,
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </span>
                  <div className="min-w-0 text-left">
                    <p className="text-xl font-extrabold leading-tight text-gc-text sm:text-[1.65rem]">{stat.value}</p>
                    <p className="mt-0.5 text-xs leading-snug text-gc-gray-text sm:text-sm">{stat.label}</p>
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
