import type { MouseEvent } from 'react';

/** Site institucional — agendamento de atendimento. */
export const GASTRO_APPOINTMENT_URL = 'https://gastrocentroslz.com.br/';

/** Altura do header fixo (px) — manter em sync com `h-[72px]` no GastroHeader. */
export const GASTRO_HEADER_HEIGHT_PX = 72;

/** Espaço extra acima da seção ao rolar via âncora (header + respiro). */
export const GASTRO_SCROLL_OFFSET_PX = GASTRO_HEADER_HEIGHT_PX + 16;

/**
 * Itens do menu na ordem das seções na página (GastrocentroHome).
 * StatsBar, BenefitsSection e CTASection não entram — sem âncora dedicada.
 */
export const gastroNavItems = [
  { label: 'Início', href: '#topo' },
  { label: 'Especialidades', href: '#especialidades' },
  { label: 'Cursos em destaque', shortLabel: 'Cursos', href: '#cursos-destaque' },
  { label: 'Médicos', href: '#especialistas' },
  { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'Contato', href: '#contato' },
] as const;

export type GastroNavItem = (typeof gastroNavItems)[number];

function scrollBehavior(preferred: ScrollBehavior = 'smooth'): ScrollBehavior {
  if (preferred === 'auto') return 'auto';
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'auto';
  }
  return preferred;
}

export function scrollToGastroAnchor(hash: string, behavior: ScrollBehavior = 'smooth') {
  const id = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!id) return;

  const target = document.getElementById(id);
  if (!target) return;

  const top = target.getBoundingClientRect().top + window.scrollY - GASTRO_SCROLL_OFFSET_PX;
  window.scrollTo({ top: Math.max(0, top), behavior: scrollBehavior(behavior) });
}

export function handleGastroAnchorClick(
  event: MouseEvent<HTMLAnchorElement>,
  href: string,
  onNavigate?: () => void,
) {
  if (!href.startsWith('#')) return;

  event.preventDefault();
  scrollToGastroAnchor(href);
  onNavigate?.();

  if (history.replaceState) {
    history.replaceState(null, '', href);
  } else {
    window.location.hash = href;
  }
}
