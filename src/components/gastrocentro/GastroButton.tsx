import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

type GastroButtonProps = {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'default' | 'lg';
  href: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
};

function isInternal(href: string) {
  return href.startsWith('/') && !href.startsWith('//');
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
    'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gc-teal focus-visible:ring-offset-2';
  const sizes = {
    default: 'h-11 px-6 text-sm',
    lg: 'h-[52px] px-8 text-[15px]',
  };
  const variants = {
    primary: 'bg-gc-coral text-white shadow-[0_8px_24px_-6px_rgba(255,107,53,0.45)] hover:bg-[#e85f2d]',
    secondary:
      'border border-white/35 bg-white/5 text-white backdrop-blur-sm hover:border-white/60 hover:bg-white/10 focus-visible:ring-offset-gc-navy',
    outline:
      'border border-gc-border bg-white text-gc-text shadow-sm hover:border-gc-teal/40 hover:text-gc-navy focus-visible:ring-offset-gc-ice',
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
    <a href={href} aria-label={ariaLabel} className={cls}>
      {children}
    </a>
  );
}
