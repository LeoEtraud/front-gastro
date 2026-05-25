import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Youtube } from 'lucide-react';
import { GC_SCROLL_ANCHOR, GastroContainer, GastroSection } from '@/components/gastrocentro/GastroLayout';
import { handleGastroAnchorClick } from '@/components/gastrocentro/gastro-nav';
import { useLegalDocuments } from '@/hooks/use-legal-documents';
import { cn } from '@/lib/utils';

const institutional = [
  { label: 'Sobre nós', href: '#topo' },
  { label: 'Especialidades', href: '#especialidades' },
  { label: 'Corpo clínico', href: '#especialistas' },
  { label: 'Contato', href: '#contato' },
];

const platform = [
  { label: 'Cursos e conteúdos', href: '#cursos-destaque' },
  { label: 'Comece por aqui', href: '#comece-aqui' },
  { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'Materiais gratuitos', href: '/login' },
  { label: 'Perguntas frequentes', href: '/login' },
];

const support = [
  { label: 'Central de ajuda', href: '/login' },
  { label: 'Fale conosco', href: '#contato' },
] as const;

const legalLinks = [
  { label: 'Política de privacidade', document: 'privacy' as const },
  { label: 'Termos de uso', document: 'terms' as const },
];

function FooterLink({ href, label }: { href: string; label: string }) {
  const cls = 'transition-colors duration-150 hover:text-gc-teal';
  if (href.startsWith('/')) {
    return (
      <Link to={href} className={cls}>
        {label}
      </Link>
    );
  }
  return (
    <a
      href={href}
      onClick={(e) => handleGastroAnchorClick(e, href)}
      className={cls}
    >
      {label}
    </a>
  );
}

export function GastroFooter() {
  const { openTerms, openPrivacy, modals } = useLegalDocuments();

  return (
    <footer
      id="contato"
      className={cn(
        'gc-font w-full bg-gc-navy text-white/60',
        GC_SCROLL_ANCHOR,
      )}
    >
      {/* Top accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gc-teal/40 to-transparent" aria-hidden />

      <GastroSection className="pt-14 pb-10 sm:pt-16">
        <GastroContainer>
          <div className="grid min-w-0 gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-12">
            {/* Brand */}
            <div className="min-w-0">
              <div className="flex min-w-0 items-start">
                <img
                  src="/logo-menu.png"
                  alt="GastroCentro"
                  className="h-14 w-auto max-w-[min(100%,13rem)] object-contain object-left sm:h-16 sm:max-w-[15rem] lg:h-[4.5rem]"
                />
              </div>
              <p className="mt-5 max-w-xs text-[13px] leading-relaxed text-white/50 sm:text-sm">
                Referência em ensino, pesquisa e cuidado em saúde digestiva. Conteúdo de qualidade para profissionais e pacientes.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  { Icon: Instagram, label: 'Instagram' },
                  { Icon: Youtube, label: 'YouTube' },
                  { Icon: Linkedin, label: 'LinkedIn' },
                ].map(({ Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 text-white/55 transition-all duration-150 hover:border-gc-teal/50 hover:bg-gc-teal/10 hover:text-gc-teal"
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  </a>
                ))}
              </div>
            </div>

            {/* Institucional */}
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/40">Institucional</p>
              <ul className="mt-5 space-y-3 text-[13px] sm:text-sm">
                {institutional.map((item) => (
                  <li key={item.label}>
                    <FooterLink {...item} />
                  </li>
                ))}
              </ul>
            </div>

            {/* Plataforma */}
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/40">Plataforma</p>
              <ul className="mt-5 space-y-3 text-[13px] sm:text-sm">
                {platform.map((item) => (
                  <li key={item.label}>
                    <FooterLink {...item} />
                  </li>
                ))}
              </ul>
            </div>

            {/* Suporte */}
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/40">Suporte</p>
              <ul className="mt-5 space-y-3 text-[13px] sm:text-sm">
                {support.map((item) => (
                  <li key={item.label}>
                    <FooterLink {...item} />
                  </li>
                ))}
                {legalLinks.map((item) => (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={item.document === 'terms' ? openTerms : openPrivacy}
                      className="transition-colors duration-150 hover:text-gc-teal"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {modals}

          {/* Copyright */}
          <div className="mt-14 border-t border-white/8 pt-7 text-center text-[12px] text-white/30">
            © 2026 GastroCentro. Todos os direitos reservados.
          </div>
        </GastroContainer>
      </GastroSection>
    </footer>
  );
}
