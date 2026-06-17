/** Utilitários Vimeo compartilhados no frontend (admin). */

const VIMEO_ID_RE = /^\d{6,12}$/;

export function extractVimeoVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (VIMEO_ID_RE.test(trimmed)) return trimmed;

  try {
    const url = trimmed.startsWith('http') ? new URL(trimmed) : new URL(`https://${trimmed}`);
    const host = url.hostname.replace(/^www\./, '');

    if (host === 'vimeo.com') {
      const segments = url.pathname.split('/').filter(Boolean);
      const numeric = segments.find((s) => VIMEO_ID_RE.test(s));
      return numeric ?? null;
    }

    if (host === 'player.vimeo.com') {
      const match = url.pathname.match(/\/video\/(\d{6,12})/);
      return match?.[1] ?? null;
    }
  } catch {
    /* URL inválida */
  }

  return null;
}

export function buildVimeoPlayerSrc(videoId: string): string {
  return `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`;
}

export function isValidVimeoInput(input: string): boolean {
  return extractVimeoVideoId(input) !== null;
}
