import { Award, Clock, Headphones, RefreshCw } from 'lucide-react';
import { GastroContainer, GastroSection } from '@/components/gastrocentro/GastroLayout';
import { benefits } from '@/data/gastrocentro-landing';
import { cn } from '@/lib/utils';

const iconMap = {
  refresh: RefreshCw,
  clock:   Clock,
  headset: Headphones,
  award:   Award,
};

const iconStyles = [
  'text-gc-teal bg-[#e4f9f9]',
  'text-gc-coral bg-[#fff3ee]',
  'text-gc-teal bg-[#e4f9f9]',
  'text-gc-coral bg-[#fff3ee]',
];

export function BenefitsSection() {
  return (
    <GastroSection className="relative z-20 -mt-14 sm:-mt-16">
      <GastroContainer>
        <div className="overflow-hidden rounded-[24px] border border-gc-border/80 bg-white shadow-[0_12px_48px_-8px_rgba(4,27,58,0.16),0_2px_8px_rgba(4,27,58,0.05)]">
          <div className="grid grid-cols-1 divide-gc-border/70 sm:grid-cols-2 lg:grid-cols-4 [&>*:not(:last-child)]:border-b [&>*:not(:last-child)]:border-gc-border/70 sm:[&>*:nth-child(odd)]:border-r sm:[&>*:nth-child(odd)]:border-gc-border/70 sm:[&>*:nth-child(-n+2)]:border-b sm:[&>*:nth-child(-n+2)]:border-gc-border/70 sm:[&>*:nth-child(n+3)]:border-b-0 lg:[&>*]:border-b-0 lg:[&>*:not(:last-child)]:border-r lg:[&>*]:border-r-0 lg:[&>*:not(:last-child)]:border-r lg:[&>*:nth-child(odd)]:border-r-0">
            {benefits.map((benefit, i) => {
              const Icon = iconMap[benefit.icon];
              return (
                <div key={benefit.id} className="flex min-w-0 flex-col gap-3 px-7 py-8 lg:px-8 lg:py-9">
                  <span
                    className={cn(
                      'inline-flex h-12 w-12 items-center justify-center rounded-xl',
                      iconStyles[i % iconStyles.length],
                    )}
                  >
                    <Icon className="h-[22px] w-[22px]" strokeWidth={2} aria-hidden />
                  </span>
                  <h3 className="text-[14px] font-bold leading-snug text-gc-text sm:text-[15px]">
                    {benefit.title}
                  </h3>
                  <p className="text-[13px] leading-relaxed text-gc-gray-text sm:text-sm">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </GastroContainer>
    </GastroSection>
  );
}
