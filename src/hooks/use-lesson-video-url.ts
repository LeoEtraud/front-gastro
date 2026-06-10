import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export type LessonVideoUrlResponse = {
  url: string;
  expiresAt: string;
  format?: 'hls' | 'mp4';
  fallbackUrl?: string | null;
};

/** Busca URL assinada curta para playback direto na CDN/S3 (sem proxy do backend). */
export function useLessonVideoUrl(lessonId: string, enabled = true) {
  return useQuery({
    queryKey: ['lesson-video-url', lessonId],
    queryFn: async () => {
      const res = await api.get<LessonVideoUrlResponse>(`/student/lessons/${lessonId}/video-url`);
      return res.data;
    },
    enabled: enabled && !!lessonId,
    staleTime: 0,
    gcTime: 60_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 403 || status === 404) return false;
      return failureCount < 2;
    },
  });
}
