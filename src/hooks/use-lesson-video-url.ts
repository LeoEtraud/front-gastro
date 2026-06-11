import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export type LessonVideoUrlResponse = {
  url: string;
  expiresAt: string;
  format?: 'hls' | 'mp4';
  fallbackUrl?: string | null;
  usesSignedCookies?: boolean;
};

export type LessonVideoUrlOptions = {
  /** Força MP4 progressivo — ideal para prévias compactas nos cards. */
  preferFormat?: 'mp4' | 'auto';
};

/** Margem antes da expiração para considerar a URL stale (React Query). */
const STALE_BUFFER_MS = 60_000;

/** TTL padrão alinhado ao backend (600s) menos margem de segurança. */
const DEFAULT_STALE_MS = 8 * 60_000;

function computeStaleTime(expiresAt?: string): number {
  if (!expiresAt) return DEFAULT_STALE_MS;
  const msUntilStale = new Date(expiresAt).getTime() - Date.now() - STALE_BUFFER_MS;
  return Math.max(30_000, Math.min(msUntilStale, DEFAULT_STALE_MS));
}

/** Busca URL assinada curta para playback direto na CDN/S3 (sem proxy do backend). */
export function useLessonVideoUrl(
  lessonId: string,
  enabled = true,
  options: LessonVideoUrlOptions = {},
) {
  const preferFormat = options.preferFormat ?? 'auto';

  return useQuery({
    queryKey: ['lesson-video-url', lessonId, preferFormat],
    queryFn: async () => {
      const params = preferFormat === 'mp4' ? { preferFormat: 'mp4' } : undefined;
      const res = await api.get<LessonVideoUrlResponse>(`/student/lessons/${lessonId}/video-url`, { params });
      return res.data;
    },
    enabled: enabled && !!lessonId,
    staleTime: DEFAULT_STALE_MS,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 403 || status === 404) return false;
      return failureCount < 2;
    },
  });
}

/** Atualiza staleTime com base no expiresAt retornado pela API. */
export function getVideoUrlStaleTime(data?: LessonVideoUrlResponse): number {
  return computeStaleTime(data?.expiresAt);
}
