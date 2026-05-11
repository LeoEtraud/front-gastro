import { useEffect, useMemo } from 'react';
import { resolveApiUrl } from '@/lib/axios';

/**
 * Prepara, em segundo plano, os recursos necessários para que os previews de
 * vídeo do Dashboard apareçam de forma instantânea no primeiro hover.
 *
 * Camadas de pré-carregamento aplicadas aqui (todas em background, sem bloquear
 * a renderização inicial):
 *  - YouTube: `<link rel="preconnect">` para os domínios do player (DNS/TLS já
 *    aquecidos) e pré-busca da thumbnail via `Image()`.
 *  - Vídeos hospedados: hint nativo `<link rel="preload" as="video">`, que
 *    compartilha cache com o elemento `<video>` (o `fetch` manual gera entrada
 *    de cache separada por usar modo CORS, então é evitado aqui).
 *
 * O componente `LessonPreviewCard` complementa essa camada trocando o
 * `preload` do `<video>` para `"auto"` após o warm-up, o que dispara o
 * download nativo escalonado por card.
 */

const preloadedImageUrls = new Set<string>();
const preconnectedHosts = new Set<string>();
const preloadedHostedUrls = new Set<string>();
const hostedPreloadLinks = new Map<string, HTMLLinkElement>();

const YOUTUBE_PRECONNECT_HOSTS = [
  'https://www.youtube.com',
  'https://www.youtube-nocookie.com',
  'https://i.ytimg.com',
  'https://yt3.ggpht.com',
  'https://googlevideo.com',
];

/** Espaço entre cada job de preload — evita rajadas que saturem a rede. */
const PRELOAD_STAGGER_MS = 220;

type IdleHandle = number;
type IdleDeadline = { didTimeout: boolean; timeRemaining: () => number };
type IdleWindow = Window & {
  requestIdleCallback?: (
    cb: (deadline: IdleDeadline) => void,
    opts?: { timeout?: number },
  ) => IdleHandle;
  cancelIdleCallback?: (handle: IdleHandle) => void;
};

function runWhenIdle(cb: () => void, timeoutMs = 2500): IdleHandle {
  const w = window as IdleWindow;
  if (typeof w.requestIdleCallback === 'function') {
    return w.requestIdleCallback(() => cb(), { timeout: timeoutMs });
  }
  return window.setTimeout(cb, 0);
}

function cancelIdle(handle: IdleHandle | null) {
  if (handle == null) return;
  const w = window as IdleWindow;
  if (typeof w.cancelIdleCallback === 'function') {
    w.cancelIdleCallback(handle);
    return;
  }
  window.clearTimeout(handle);
}

function ensurePreconnect(href: string) {
  if (preconnectedHosts.has(href)) return;
  preconnectedHosts.add(href);
  if (typeof document === 'undefined') return;
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = href;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}

function preloadImage(src: string) {
  if (!src || preloadedImageUrls.has(src)) return;
  preloadedImageUrls.add(src);
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
}

function preloadHostedVideoHint(absoluteUrl: string) {
  if (!absoluteUrl || preloadedHostedUrls.has(absoluteUrl)) return;
  preloadedHostedUrls.add(absoluteUrl);
  if (typeof document === 'undefined') return;
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'video';
  link.href = absoluteUrl;
  // Sem `crossorigin`: alinha com o request que o <video> faz (no-cors).
  document.head.appendChild(link);
  hostedPreloadLinks.set(absoluteUrl, link);
}

export interface VideoPreviewPreloadEntry {
  hostedUrl?: string | null;
  youtubeId?: string | null;
}

export function useVideoPreviewPreload(entries: VideoPreviewPreloadEntry[]): void {
  // Chave estável: o effect só reroda quando o conjunto realmente muda.
  const dedupedKey = useMemo(
    () => entries.map((e) => `${e.hostedUrl ?? ''}::${e.youtubeId ?? ''}`).join('|'),
    [entries],
  );

  useEffect(() => {
    if (entries.length === 0) return;
    if (typeof window === 'undefined') return;

    const idleHandles: IdleHandle[] = [];
    const timeoutHandles: number[] = [];
    let cancelled = false;

    const hasYoutube = entries.some((e) => Boolean(e.youtubeId));
    if (hasYoutube) {
      YOUTUBE_PRECONNECT_HOSTS.forEach(ensurePreconnect);
    }

    entries.forEach((entry, idx) => {
      const startDelay = idx * PRELOAD_STAGGER_MS;
      const timeoutId = window.setTimeout(() => {
        if (cancelled) return;
        const handle = runWhenIdle(() => {
          if (cancelled) return;
          if (entry.youtubeId) {
            preloadImage(`https://i.ytimg.com/vi/${entry.youtubeId}/hqdefault.jpg`);
          }
          if (entry.hostedUrl) {
            const absolute = resolveApiUrl(entry.hostedUrl);
            preloadHostedVideoHint(absolute);
          }
        });
        idleHandles.push(handle);
      }, startDelay);
      timeoutHandles.push(timeoutId);
    });

    return () => {
      cancelled = true;
      timeoutHandles.forEach((id) => window.clearTimeout(id));
      idleHandles.forEach((handle) => cancelIdle(handle));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dedupedKey]);
}
