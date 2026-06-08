import { resolveApiUrl } from '@/lib/axios';

const HLS_PATH_PATTERN = /\.m3u8(\?|$)|\/video\/hls\//i;

const EXTERNAL_VIDEO_HOSTS = new Set([
  'www.youtube.com',
  'youtube.com',
  'youtu.be',
  'm.youtube.com',
]);

function parseAllowedCdnHosts(): Set<string> {
  const raw = import.meta.env.VITE_VIDEO_CDN_ALLOWED_HOSTS?.trim();
  if (!raw) return new Set();
  return new Set(
    raw
      .split(',')
      .map((h: string) => h.trim().toLowerCase())
      .filter(Boolean),
  );
}

/** Indica se a URL aponta para uma playlist HLS (.m3u8). */
export function isHlsPlaybackUrl(url: string): boolean {
  return HLS_PATH_PATTERN.test(url);
}

/** Resolve caminhos relativos da API ou URLs absolutas autorizadas. */
export function resolvePlaybackUrl(pathOrUrl: string): string {
  return resolveApiUrl(pathOrUrl);
}

/**
 * Valida se a URL de reprodução é permitida (API autenticada, CDN configurada ou YouTube).
 * Bloqueia links diretos permanentes de S3/R2 não autorizados.
 */
export function isAllowedPlaybackUrl(url: string): boolean {
  if (!url?.trim()) return false;

  if (url.startsWith('/api/')) return true;

  try {
    const parsed = new URL(url, window.location.origin);
    const host = parsed.hostname.toLowerCase();

    if (EXTERNAL_VIDEO_HOSTS.has(host)) return true;

    const apiOrigin = import.meta.env.VITE_API_ORIGIN?.trim().replace(/\/$/, '');
    if (apiOrigin) {
      const apiHost = new URL(apiOrigin).hostname.toLowerCase();
      if (host === apiHost) return true;
    }

    if (import.meta.env.DEV && (host === window.location.hostname || host === 'localhost')) {
      return parsed.pathname.startsWith('/api/');
    }

    const cdnHosts = parseAllowedCdnHosts();
    if (cdnHosts.has(host)) return true;

    // CloudFront: URLs de distribuição não expõem o bucket S3 diretamente.
    if (host.endsWith('.cloudfront.net') && /\.m3u8(\?|$)/i.test(parsed.pathname)) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

type HostedVideoUrls = {
  videoHlsPlaybackUrl?: string | null;
  videoPlaybackUrl?: string | null;
  videoHlsPreviewUrl?: string | null;
  videoPreviewUrl?: string | null;
};

function pickHostedUrl(
  hlsUrl?: string | null,
  fallbackUrl?: string | null,
): string | null {
  const hls = hlsUrl?.trim();
  if (hls) return resolvePlaybackUrl(hls);

  const legacy = fallbackUrl?.trim();
  if (legacy && isHlsPlaybackUrl(legacy)) return resolvePlaybackUrl(legacy);

  return legacy ? resolvePlaybackUrl(legacy) : null;
}

/** Escolhe a melhor URL de playback hospedado (HLS preferencial sobre progressivo). */
export function resolveHostedPlaybackUrl(lesson: HostedVideoUrls): string | null {
  return pickHostedUrl(lesson.videoHlsPlaybackUrl, lesson.videoPlaybackUrl);
}

/** Escolhe a melhor URL de prévia hospedada (cards/carrossel). */
export function resolveHostedPreviewUrl(lesson: HostedVideoUrls): string | null {
  return pickHostedUrl(lesson.videoHlsPreviewUrl ?? lesson.videoHlsPlaybackUrl, lesson.videoPreviewUrl);
}

/** Retorna URL primária (HLS se existir) e fallback MP4 para reprodução resiliente. */
export function resolveHostedPlaybackSources(lesson: HostedVideoUrls): {
  src: string | null;
  fallbackSrc: string | null;
} {
  const hls = (lesson.videoHlsPlaybackUrl ?? lesson.videoHlsPreviewUrl)?.trim();
  const progressive = (lesson.videoPlaybackUrl ?? lesson.videoPreviewUrl)?.trim();

  if (hls) {
    return {
      src: resolvePlaybackUrl(hls),
      fallbackSrc: progressive && !isHlsPlaybackUrl(progressive)
        ? resolvePlaybackUrl(progressive)
        : null,
    };
  }

  const legacy = progressive;
  if (!legacy) return { src: null, fallbackSrc: null };

  return {
    src: resolvePlaybackUrl(legacy),
    fallbackSrc: null,
  };
}

/** Safari e iOS reproduzem HLS nativamente via `<video src>`. */
export function canPlayNativeHls(video?: HTMLVideoElement | null): boolean {
  const el = video ?? document.createElement('video');
  return el.canPlayType('application/vnd.apple.mpegurl') !== ''
    || el.canPlayType('application/x-mpegURL') !== '';
}
