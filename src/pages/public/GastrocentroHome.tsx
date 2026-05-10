import { GastroHeader } from '@/components/gastrocentro/GastroHeader';
import { GastroHero } from '@/components/gastrocentro/GastroHero';
import { SectionCarousel } from '@/components/gastrocentro/SectionCarousel';
import { ContentCard } from '@/components/gastrocentro/ContentCard';
import { CTASection } from '@/components/gastrocentro/CTASection';
import { GastroFooter } from '@/components/gastrocentro/GastroFooter';
import { gastrocentroShowcaseSections } from '@/data/gastrocentro-showcase';

/** Landing institucional / vitrine de conteúdo — inspirada em composição tipo showcase, sem copiar identidade de terceiros. */
export default function GastrocentroHome() {
  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900 antialiased selection:bg-cyan-200/60">
      <GastroHeader />
      <main>
        <GastroHero />
        <div className="bg-slate-50">
          {gastrocentroShowcaseSections.map((section) => (
            <SectionCarousel
              key={section.id}
              id={section.id}
              title={section.title}
              description={section.description}
              className={section.id === 'mais-acessados' ? 'pb-4' : undefined}
            >
              {section.cards.map((card) => (
                <ContentCard
                  key={card.id}
                  title={card.title}
                  subtitle={card.subtitle}
                  category={card.category}
                  imageSrc={card.imageSrc}
                  href={card.href}
                />
              ))}
            </SectionCarousel>
          ))}
        </div>
        <CTASection />
      </main>
      <GastroFooter />
    </div>
  );
}
