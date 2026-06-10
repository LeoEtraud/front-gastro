import { resolveApiUrl } from '@/lib/axios';

const HLS_PATH_PATTERN = /\.m3u8(\?|$)|\/video\/hls\//i;
const MEDIA_EXTENSIONS = /\.(mp4|webm|m3u8|ts)(\?|$)/i;
const LEGACY_API_VIDEO_PATTERN = /\/api\/student\/lessons\/[^/]+\/video(\/|$|\?)/i;

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

function isS3CompatibleHost(host: string): boolean {
  return (
    host.includes('.amazonaws.com')
    || host.endsWith('.r2.cloudflarestorage.com')
    || host.endsWith('.digitaloceanspaces.com')
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
 * Valida se a URL de reprodução é permitida (CDN/S3 assinado ou YouTube).
 * Bloqueia proxy legado do backend e links permanentes não autorizados.
 */
export function isAllowedPlaybackUrl(url: string): boolean {
  if (!url?.trim()) return false;

  if (LEGACY_API_VIDEO_PATTERN.test(url)) return false;

  try {
    const parsed = new URL(url, window.location.origin);
    const host = parsed.hostname.toLowerCase();

    if (EXTERNAL_VIDEO_HOSTS.has(host)) return true;

    if (host.endsWith('.cloudfront.net') && MEDIA_EXTENSIONS.test(parsed.pathname)) return true;

    const cdnHosts = parseAllowedCdnHosts();
    if (cdnHosts.has(host) && MEDIA_EXTENSIONS.test(parsed.pathname)) return true;

    if (isS3CompatibleHost(host) && MEDIA_EXTENSIONS.test(parsed.pathname)) return true;

    return false;
  } catch {
    return false;
  }
}

/** Safari e iOS reproduzem HLS nativamente via `<video src>`. */
export function canPlayNativeHls(video?: HTMLVideoElement | null): boolean {
  const el = video ?? document.createElement('video');
  return el.canPlayType('application/vnd.apple.mpegurl') !== ''
    || el.canPlayType('application/x-mpegURL') !== '';
}
