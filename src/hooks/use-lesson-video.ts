import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export type LessonVideoResponse = {
  provider: 'vimeo';
  vimeoVideoId: string;
  embedUrl: string;
  duration?: number | null;
};

export function useLessonVideo(courseId: string | undefined, lessonId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['lesson-video', courseId, lessonId],
    enabled: Boolean(courseId && lessonId && enabled),
    queryFn: async () => {
      const res = await api.get<LessonVideoResponse>(
        `/courses/${courseId}/lessons/${lessonId}/video`,
      );
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
