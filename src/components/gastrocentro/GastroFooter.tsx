import { Link } from 'react-router-dom';
import { Activity, Instagram, Linkedin, Youtube } from 'lucide-react';
import { GastroContainer, GastroSection } from '@/components/gastrocentro/GastroLayout';

const institutional = [
  { label: 'Sobre nós', href: '#topo' },
  { label: 'Especialidades', href: '#especialidades' },
  { label: 'Corpo clínico', href: '#especialistas' },
  { label: 'Contato', href: '#contato' },
];

const platform = [
  { label: 'Cursos e conteúdos', href: '#cursos-destaque' },
  { label: 'Agenda de lives', href: '#comece-aqui' },
  { label: 'Materiais gratuitos', href: '/login' },
  { label: 'Perguntas frequentes', href: '/login' },
];

const support = [
  { label: 'Central de ajuda', href: '/login' },
  { label: 'Fale conosco', href: '#contato' },
  { label: 'Política de privacidade', href: '/login' },
  { label: 'Termos de uso', href: '/login' },
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
    <a href={href} className="transition hover:text-gc-coral">
      {label}
    </a>
  );
}

export function GastroFooter() {
  return (
    <footer id="contato" className="gc-font w-full border-t border-gc-border bg-white text-gc-gray-text">
      <GastroSection className="pt-14 pb-8">
        <GastroContainer>
          <div className="grid min-w-0 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gc-teal to-gc-coral">
                  <Activity className="h-[18px] w-[18px] text-white" aria-hidden />
                </span>
                <span className="text-lg font-bold text-gc-text">GastroCentro</span>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-relaxed">
                Referência em ensino, pesquisa e cuidado em saúde digestiva. Conteúdo de qualidade para profissionais e
                pacientes.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {[
                  { Icon: Instagram, label: 'Instagram' },
                  { Icon: Youtube, label: 'YouTube' },
                  { Icon: Linkedin, label: 'LinkedIn' },
                ].map(({ Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gc-border text-gc-text transition hover:border-gc-teal hover:text-gc-teal"
                  >
                    <Icon className="h-4 w-4" />
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
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-gc-border pt-6 text-center text-xs">
            © 2026 GastroCentro. Todos os direitos reservados.
          </div>
        </GastroContainer>
      </GastroSection>
    </footer>
  );
}
