import type { MouseEvent } from 'react';

/** Site institucional GastroCentro — página "Sobre nós". */
export const GASTRO_ABOUT_URL = 'https://gastrocentroslz.com.br/';

/** @deprecated Use GASTRO_ABOUT_URL */
export const GASTRO_APPOINTMENT_URL = GASTRO_ABOUT_URL;

/** Altura do header fixo (px) — manter em sync com `h-[88px]` no GastroHeader. */
export const GASTRO_HEADER_HEIGHT_PX = 88;

/** Respiro visual entre o header e o conteúdo da seção ao navegar por âncora. */
export const GASTRO_SCROLL_GAP_PX = 12;

/** Offset total usado no scroll-margin CSS e no marcador de seção ativa. */
export const GASTRO_SCROLL_OFFSET_PX = GASTRO_HEADER_HEIGHT_PX + GASTRO_SCROLL_GAP_PX;

/**
 * Itens do menu na ordem das seções na página (GastrocentroHome).
 * StatsBar, BenefitsSection e CTASection não entram — sem âncora dedicada.
 */
export const gastroNavItems = [
  { label: 'Início', href: '#topo' },
  { label: 'Comece por aqui', shortLabel: 'Comece', href: '#comece-aqui' },
  { label: 'Fellowship', shortLabel: 'Curso', href: '#cursos-destaque' },
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

/**
 * Rola até a âncora posicionando o conteúdo útil (após o padding da seção)
 * logo abaixo do header fixo — evita título escondido ou excesso de espaço vazio.
 */
export function scrollToGastroAnchor(hash: string, behavior: ScrollBehavior = 'smooth') {
  const id = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!id) return;

  // Início: sempre no topo absoluto da página
  if (id === 'topo') {
    window.scrollTo({ top: 0, behavior: scrollBehavior(behavior) });
    return;
  }

  const target = document.getElementById(id);
  if (!target) return;

  const paddingTop = parseFloat(getComputedStyle(target).paddingTop) || 0;
  const contentTop =
    target.getBoundingClientRect().top + window.scrollY + paddingTop;
  const top = contentTop - GASTRO_SCROLL_OFFSET_PX;

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
