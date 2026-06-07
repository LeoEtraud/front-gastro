import { Award, BookOpen, FileText, Users } from 'lucide-react';
import { GastroContainer, GastroSection } from '@/components/gastrocentro/GastroLayout';
import { stats } from '@/data/gastrocentro-landing';
import { cn } from '@/lib/utils';

const iconMap = {
  book: BookOpen,
  users: Users,
  files: FileText,
  award: Award,
};

const colorMap = {
  book: 'bg-[#fff3ee] text-gc-coral',
  users: 'bg-[#e4f9f9] text-gc-teal',
  files: 'bg-[#fffbeb] text-[#d4940e]',
  award: 'bg-[#eaf0fb] text-gc-mid',
};

export function StatsBar() {
  return (
    <GastroSection className="relative z-20 -mt-10 sm:-mt-12" aria-label="Destaques da plataforma">
      <GastroContainer>
        <div className="overflow-hidden rounded-[24px] border border-gc-border/80 bg-white shadow-[0_12px_48px_-8px_rgba(4,27,58,0.18),0_2px_8px_rgba(4,27,58,0.06)]">
          <div className="grid grid-cols-1 divide-y divide-gc-border/70 sm:grid-cols-2 sm:[&>*:nth-child(odd)]:border-r sm:[&>*:nth-child(odd)]:border-gc-border/70 lg:grid-cols-4 lg:divide-x lg:divide-y-0 lg:[&>*]:border-r-0 lg:[&>*:not(:last-child)]:border-r lg:[&>*:not(:last-child)]:border-gc-border/70">
            {stats.map((stat) => {
              const Icon = iconMap[stat.icon];
              const colors = colorMap[stat.icon];
              return (
                <div
                  key={stat.id}
                  className="flex min-w-0 items-start gap-3.5 px-5 py-6 sm:px-6 sm:py-7 lg:gap-4 lg:px-7"
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
                    <p className="text-[14px] font-extrabold leading-snug tracking-tight text-gc-text sm:text-[15px]">
                      {stat.title}
                    </p>
                    <p className="mt-1.5 text-[12px] leading-snug text-gc-gray-text sm:text-[13px]">
                      {stat.subtitle}
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
