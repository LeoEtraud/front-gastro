import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './use-reduced-motion';

type UseCarouselOptions = {
  length: number;
  autoplayMs?: number;
  loop?: boolean;
};

export function useCarousel({ length, autoplayMs = 4500, loop = true }: UseCarouselOptions) {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback(
    (next: number) => {
      if (length <= 0) return;
      if (loop) {
        setIndex(((next % length) + length) % length);
      } else {
        setIndex(Math.max(0, Math.min(length - 1, next)));
      }
    },
    [length, loop],
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (reducedMotion || paused || length <= 1) return;
    const id = window.setInterval(next, autoplayMs);
    return () => window.clearInterval(id);
  }, [autoplayMs, index, length, next, paused, reducedMotion]);

  const onTouchStart = (clientX: number) => {
    touchStartX.current = clientX;
  };

  const onTouchEnd = (clientX: number) => {
    if (touchStartX.current == null) return;
    const delta = clientX - touchStartX.current;
    if (Math.abs(delta) > 48) {
      if (delta < 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  return {
    index,
    goTo,
    next,
    prev,
    paused,
    setPaused,
    onTouchStart,
    onTouchEnd,
    reducedMotion,
  };
}
