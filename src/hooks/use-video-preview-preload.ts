import { useEffect, useRef } from 'react';

/**
 * Hook de pré-carregamento inteligente via IntersectionObserver.
 *
 * Estratégia:
 *  1. Observa o elemento DOM passado via `ref`.
 *  2. Quando o card entra no viewport (threshold 10%), aguarda um pequeno
 *     delay antes de sinalizar "warm-up" — isso evita disparar para cards
 *     que o usuário simplesmente rolou por cima rapidamente.
 *  3. Quando sai do viewport, cancela o timer de warm-up se ainda estiver
 *     pendente, preservando largura de banda.
 *
 * Diferente da versão anterior (setTimeout + requestIdleCallback global),
 * essa versão só aquece vídeos que estão VISÍVEIS na tela, o que é muito
 * mais conservador com banda e CPU em dispositivos móveis.
 */
export function useInViewportWarmup(
  ref: React.RefObject<Element | null>,
  onWarmup: () => void,
  options: {
    /** % visível para disparar (0.1 = 10%). Padrão: 0.1 */
    threshold?: number;
    /** ms de visibilidade contínua antes de disparar warm-up. Padrão: 400 */
    delayMs?: number;
    /** Se false, o observer nunca é criado. Útil para desabilitar. */
    enabled?: boolean;
  } = {},
): void {
  const { threshold = 0.1, delayMs = 400, enabled = true } = options;

  // Ref estável para o callback para não precisar incluir no deps do effect.
  const onWarmupRef = useRef(onWarmup);
  onWarmupRef.current = onWarmup;

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    let timerId: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timerId = setTimeout(() => {
            onWarmupRef.current();
          }, delayMs);
        } else {
          if (timerId !== null) {
            clearTimeout(timerId);
            timerId = null;
          }
        }
      },
      { threshold },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (timerId !== null) clearTimeout(timerId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, threshold, delayMs]);
}
