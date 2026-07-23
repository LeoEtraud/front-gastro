import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type {
  CommentModerationHistoryEntry,
  CommentRiskLevel,
  ListPendingCommentsResponse,
} from '@/types/api';

const PENDING_KEY = 'moderation-pending-comments';

export function usePendingComments(options: {
  page: number;
  riskLevel?: CommentRiskLevel | 'all';
}) {
  const { page, riskLevel = 'all' } = options;
  return useQuery({
    queryKey: [PENDING_KEY, page, riskLevel],
    queryFn: async () => {
      const params: Record<string, string | number> = { page };
      if (riskLevel && riskLevel !== 'all') params.riskLevel = riskLevel;
      const res = await api.get<ListPendingCommentsResponse>(
        '/moderation/comments/pending',
        { params },
      );
      return res.data;
    },
    placeholderData: (previous) => previous,
  });
}

export type ModerationActionType = 'approve' | 'hide' | 'remove' | 'request-edit';

export function useModerateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      commentId: string;
      action: ModerationActionType;
      reason?: string;
    }) => {
      const res = await api.post<{ id: string; status: string }>(
        `/moderation/comments/${input.commentId}/${input.action}`,
        { reason: input.reason },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PENDING_KEY] });
    },
  });
}

export function useCommentModerationHistory(commentId: string | null) {
  return useQuery({
    queryKey: ['comment-moderation-history', commentId],
    queryFn: async () => {
      const res = await api.get<{ history: CommentModerationHistoryEntry[] }>(
        `/moderation/comments/${commentId}/history`,
      );
      return res.data.history;
    },
    enabled: !!commentId,
  });
}

export function useRestrictUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      userId: string;
      reason: string;
      durationHours?: number | null;
    }) => {
      const res = await api.post('/moderation/restrictions', input);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PENDING_KEY] });
    },
  });
}
