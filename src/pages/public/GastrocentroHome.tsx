import { useEffect } from 'react';
import { BenefitsSection } from '@/components/gastrocentro/BenefitsSection';
import { scrollToGastroAnchor } from '@/components/gastrocentro/gastro-nav';
import { CTASection } from '@/components/gastrocentro/CTASection';
import { FeaturedCoursesSection } from '@/components/gastrocentro/FeaturedCoursesSection';
import { GastroFooter } from '@/components/gastrocentro/GastroFooter';
import { GastroHeader } from '@/components/gastrocentro/GastroHeader';
import { HeroCarousel } from '@/components/gastrocentro/HeroCarousel';
import { SpecialistsSection } from '@/components/gastrocentro/SpecialistsSection';
import { SpecialtiesSection } from '@/components/gastrocentro/SpecialtiesSection';
import { StartHereSection } from '@/components/gastrocentro/StartHereSection';
import { StatsBar } from '@/components/gastrocentro/StatsBar';
import { TestimonialsSection } from '@/components/gastrocentro/TestimonialsSection';

/** Landing institucional GastroCentro — plataforma de educação médica em saúde digestiva. */
export default function GastrocentroHome() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    requestAnimationFrame(() => {
      scrollToGastroAnchor(hash, 'auto');
    });
  }, []);

  return (
    <div className="gc-font min-h-dvh w-full min-w-0 scroll-smooth scroll-pt-[88px] overflow-x-hidden bg-gc-ice text-gc-text antialiased selection:bg-gc-teal/20">
      <GastroHeader />
      <main className="w-full min-w-0">
        <HeroCarousel />
        <StatsBar />
        <StartHereSection />
        <SpecialtiesSection />
        <FeaturedCoursesSection />
        <SpecialistsSection />
        <TestimonialsSection />
        <BenefitsSection />
        <CTASection />
      </main>
      <GastroFooter />
    </div>
  );
}
