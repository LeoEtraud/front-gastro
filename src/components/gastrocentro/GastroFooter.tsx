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
  if (href.startsWith('/')) {
    return (
      <Link to={href} className="transition hover:text-gc-coral">
        {label}
      </Link>
    );
  }
  return (
    <a
      href={href}
      onClick={(e) => handleGastroAnchorClick(e, href)}
      className="transition hover:text-gc-coral"
    >
      {label}
    </a>
  );
}

export function GastroFooter() {
  const { openTerms, openPrivacy, modals } = useLegalDocuments();

  return (
    <footer id="contato" className={cn('gc-font w-full border-t border-gc-border bg-white text-gc-gray-text', GC_SCROLL_ANCHOR)}>
      <GastroSection className="pt-8 pb-8 sm:pt-10">
        <GastroContainer>
          <div className="grid min-w-0 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div className="min-w-0">
              <div className="flex min-w-0 items-start">
                <img
                  src="/logo.jpg"
                  alt="GastroCentro"
                  className="h-14 w-auto max-w-[min(100%,12rem)] object-contain object-left sm:h-16 sm:max-w-[14rem] lg:h-[4.5rem] lg:max-w-[15rem]"
                />
              </div>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-gc-text">
                Referência em ensino, pesquisa e cuidado em saúde digestiva. Conteúdo de qualidade para profissionais e
                pacientes.
              </p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-2.5">
                {[
                  { Icon: Instagram, label: 'Instagram' },
                  { Icon: Youtube, label: 'YouTube' },
                  { Icon: Linkedin, label: 'LinkedIn' },
                ].map(({ Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    className="inline-flex items-center gap-2.5 rounded-lg border border-gc-border px-3 py-2 text-sm font-medium text-gc-text transition hover:border-gc-teal hover:text-gc-teal"
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span>{label}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-gc-text">Institucional</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {institutional.map((item) => (
                  <li key={item.label}>
                    <FooterLink {...item} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-gc-text">Plataforma</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {platform.map((item) => (
                  <li key={item.label}>
                    <FooterLink {...item} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-gc-text">Suporte</p>
              <ul className="mt-4 space-y-2.5 text-sm">
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
                      className="transition hover:text-gc-coral"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {modals}

          <div className="mt-12 border-t border-gc-border pt-6 text-center text-xs">
            © 2026 GastroCentro. Todos os direitos reservados.
          </div>
        </GastroContainer>
      </GastroSection>
    </footer>
  );
}
