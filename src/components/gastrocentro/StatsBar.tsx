import { Heart, Layers, Play, Users } from 'lucide-react';
import { GastroContainer, GastroSection } from '@/components/gastrocentro/GastroLayout';
import { stats } from '@/data/gastrocentro-landing';

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
    <GastroSection className="relative z-20 -mt-14 sm:-mt-16" aria-label="Métricas da plataforma">
      <GastroContainer>
        <div className="overflow-hidden rounded-[18px] border border-gc-border bg-white shadow-[0_8px_40px_-8px_rgba(4,27,58,0.15)]">
          <div className="grid grid-cols-2 divide-x divide-y divide-gc-border lg:grid-cols-4 lg:divide-y-0">
            {stats.map((stat) => {
              const Icon = iconMap[stat.icon];
              const colors = colorMap[stat.icon];
              return (
                <div key={stat.id} className="flex min-w-0 flex-col items-center gap-2 px-4 py-8 text-center sm:py-9">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors}`}>
                    <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </span>
                  <p className="text-[1.65rem] font-extrabold leading-none text-gc-text">{stat.value}</p>
                  <p className="text-sm text-gc-gray-text">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </GastroContainer>
    </GastroSection>
  );
}
