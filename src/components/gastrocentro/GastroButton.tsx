import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

type GastroButtonProps = {
  /**
   * Escala de CTAs:
   * - primary: conversão global (Header, CTA final)
   * - card: ação em seções/cards/slides (mais discreto)
   * - secondary: CTA auxiliar em fundo escuro
   * - outline: ação neutra em fundo claro
   */
  variant?: 'primary' | 'card' | 'secondary' | 'outline';
  size?: 'default' | 'lg';
  href: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
};

function isInternal(href: string) {
  return href.startsWith('/') && !href.startsWith('//');
}

function isExternal(href: string) {
  return href.startsWith('http://') || href.startsWith('https://');
}

export function GastroButton({
  variant = 'primary',
  size = 'default',
  href,
  children,
  className,
  ariaLabel,
}: GastroButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gc-teal focus-visible:ring-offset-2';

  const sizes = {
    default: 'h-11 px-6 text-[14px]',
    lg: 'h-[52px] px-8 text-[15px]',
  };

  const variants = {
    // Nível 1 — conversão principal
    primary:
      'bg-[linear-gradient(90deg,#FF6A2A_0%,#FF8745_100%)] text-white shadow-[0_10px_30px_rgba(255,106,42,0.30)] hover:bg-[#FF5416] hover:[background-image:none] hover:shadow-[0_12px_34px_rgba(255,106,42,0.36)]',
    // Nível 2 — ação local em cards
    card:
      'bg-[#FF6A2A] text-white shadow-none hover:bg-[#FF5416] focus-visible:ring-offset-gc-ice',
    secondary:
      'border border-white/35 bg-transparent text-white hover:bg-white/[0.08] focus-visible:ring-offset-gc-navy',
    outline:
      'border-2 border-[#FF6A2A] bg-white text-[#FF6A2A] shadow-none hover:bg-[#FF6A2A]/[0.06] focus-visible:ring-offset-gc-ice',
  };

  const cls = cn(base, sizes[size], variants[variant], className);

  if (isInternal(href)) {
    return (
      <Link to={href} aria-label={ariaLabel} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className={cls}
      {...(isExternal(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  );
}
