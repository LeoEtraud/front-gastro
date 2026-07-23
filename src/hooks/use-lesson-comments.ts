import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type {
  CommentSort,
  CreateCommentResponse,
  ListCommentsResponse,
} from '@/types/api';

const COMMENTS_KEY = 'lesson-comments';

export function lessonCommentsQueryKey(lessonId: string, sort: CommentSort, page: number) {
  return [COMMENTS_KEY, lessonId, sort, page] as const;
}

export function useLessonComments(
  lessonId: string,
  options: { sort: CommentSort; page: number; enabled?: boolean },
) {
  const { sort, page, enabled = true } = options;
  return useQuery({
    queryKey: lessonCommentsQueryKey(lessonId, sort, page),
    queryFn: async () => {
      const res = await api.get<ListCommentsResponse>(
        `/lessons/${lessonId}/comments`,
        { params: { sort, page } },
      );
      return res.data;
    },
    enabled: !!lessonId && enabled,
    placeholderData: (previous) => previous,
  });
}

function invalidateLessonComments(
  queryClient: ReturnType<typeof useQueryClient>,
  lessonId: string,
) {
  queryClient.invalidateQueries({ queryKey: [COMMENTS_KEY, lessonId] });
}

export function useCreateLessonComment(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { text: string; parentCommentId?: string | null }) => {
      const res = await api.post<CreateCommentResponse>(
        `/lessons/${lessonId}/comments`,
        { text: input.text, parentCommentId: input.parentCommentId ?? null },
      );
      return res.data;
    },
    onSuccess: () => invalidateLessonComments(queryClient, lessonId),
  });
}

export function useUpdateLessonComment(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { commentId: string; text: string }) => {
      const res = await api.patch<CreateCommentResponse>(
        `/lessons/${lessonId}/comments/${input.commentId}`,
        { text: input.text },
      );
      return res.data;
    },
    onSuccess: () => invalidateLessonComments(queryClient, lessonId),
  });
}

export function useDeleteLessonComment(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (commentId: string) => {
      await api.delete(`/lessons/${lessonId}/comments/${commentId}`);
    },
    onSuccess: () => invalidateLessonComments(queryClient, lessonId),
  });
}

/** Professor: ocultar comentário da própria aula. */
export function useHideLessonComment(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { commentId: string; reason?: string }) => {
      await api.post(`/lessons/${lessonId}/comments/${input.commentId}/hide`, {
        reason: input.reason,
      });
    },
    onSuccess: () => invalidateLessonComments(queryClient, lessonId),
  });
}

/** Professor: encaminhar comentário para moderação. */
export function useEscalateLessonComment(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { commentId: string; reason?: string }) => {
      await api.post(`/lessons/${lessonId}/comments/${input.commentId}/escalate`, {
        reason: input.reason,
      });
    },
    onSuccess: () => invalidateLessonComments(queryClient, lessonId),
  });
}
