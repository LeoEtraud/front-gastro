import { Award, Clock, Headphones, RefreshCw } from 'lucide-react';
import { GastroContainer, GastroSection } from '@/components/gastrocentro/GastroLayout';
import { benefits } from '@/data/gastrocentro-landing';
import { cn } from '@/lib/utils';

const iconMap = {
  refresh: RefreshCw,
  clock: Clock,
  headset: Headphones,
  award: Award,
};

const iconStyles = [
  'text-gc-teal bg-[#e6fafa]',
  'text-gc-coral bg-[#fff0ea]',
  'text-gc-teal bg-[#e6fafa]',
  'text-gc-coral bg-[#fff0ea]',
];

export function BenefitsSection() {
  return (
    <GastroSection className="relative z-20 -mt-12 sm:-mt-14">
      <GastroContainer>
        <div className="overflow-hidden rounded-[18px] border border-gc-border bg-white shadow-[0_8px_40px_-8px_rgba(4,27,58,0.12)]">
          <div className="grid grid-cols-1 divide-y divide-gc-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            {benefits.map((benefit, i) => {
              const Icon = iconMap[benefit.icon];
              return (
                <div key={benefit.id} className="flex min-w-0 flex-col gap-2.5 px-6 py-7 sm:py-8">
                  <span
                    className={cn(
                      'inline-flex h-10 w-10 items-center justify-center rounded-xl',
                      iconStyles[i % iconStyles.length],
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                  </span>
                  <h3 className="text-sm font-bold text-gc-text">{benefit.title}</h3>
                  <p className="text-sm leading-relaxed text-gc-gray-text">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </GastroContainer>
    </GastroSection>
  );
}
