import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import '@/styles/animations/text-focus-in.css';

interface AuthLayoutProps {
  /** Caminho para a imagem de fundo do hero. */
  heroBg: string;
  heroTitle: string;
  heroSubtitle: string;
  children: ReactNode;
  /** Tailwind max-w class do card de formulário. Padrão: max-w-[440px] */
  formMaxWidth?: string;
}

export function AuthLayout({
  heroBg,
  heroTitle,
  heroSubtitle,
  children,
  formMaxWidth = 'max-w-[440px]',
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-dvh overflow-x-hidden bg-[#EEF2F8] md:grid-cols-[minmax(0,55%)_minmax(0,45%)]">

      {/* ── Hero ── */}
      <div className="relative hidden overflow-hidden md:flex md:flex-col md:items-center md:justify-center">
        <img
          src={heroBg}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Gradiente com profundidade — não fecha completamente a imagem */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(145deg, rgba(4,27,58,0.87) 0%, rgba(8,42,79,0.68) 38%, rgba(14,61,110,0.60) 62%, rgba(4,27,58,0.82) 100%)',
          }}
        />
        {/* Vinheta nas bordas para dar mais profundidade */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            boxShadow: 'inset 0 0 120px rgba(4,27,58,0.55)',
          }}
        />
        <div className="relative z-10 max-w-[400px] px-10 text-center">
          <img
            src="/logo-menu-login.png"
            alt="GastroCentro"
            className="mx-auto mb-4 h-[110px] w-[110px] object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.35)]"
            width={110}
            height={110}
          />
          <h2 className="text-focus-in mb-5 font-display text-[30px] font-extrabold leading-[1.15] tracking-tight text-white">
            {heroTitle}
          </h2>
          <p className="mx-auto max-w-[320px] text-[15.5px] leading-relaxed text-white/70">
            {heroSubtitle}
          </p>
        </div>
      </div>

      {/* ── Formulário ── */}
      <div className="flex min-w-0 items-center justify-center px-4 py-8 sm:px-7 sm:py-10">
        <div className={cn('w-full', formMaxWidth)}>{children}</div>
      </div>
    </div>
  );
}
