import { useState } from 'react';
import { AlertCircle, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { isStaffRole } from '@/lib/permissions';
import type { CommentSort } from '@/types/api';
import { useCreateLessonComment, useLessonComments } from '@/hooks/use-lesson-comments';
import { COMMENT_GUIDANCE } from '@/lib/comment-utils';
import { cn } from '@/lib/utils';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';

type LessonCommentsSectionProps = {
  lessonId: string;
  /** Quando true, remove o card/cabeçalho externo (uso em abas). */
  embedded?: boolean;
};

export function LessonCommentsSection({ lessonId, embedded = false }: LessonCommentsSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sort, setSort] = useState<CommentSort>('recent');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, isFetching, refetch } = useLessonComments(lessonId, {
    sort,
    page,
  });
  const createComment = useCreateLessonComment(lessonId);

  const isStaff = user ? isStaffRole(user.role) : false;

  const handleSortChange = (next: CommentSort) => {
    if (next === sort) return;
    setSort(next);
    setPage(1);
  };

  const handleCreate = async (text: string): Promise<boolean> => {
    try {
      const res = await createComment.mutateAsync({ text });
      const { moderation } = res;
      if (moderation.published) {
        toast({ variant: 'success', title: moderation.message });
        setPage(1);
        return true;
      }
      if (moderation.messageKey === 'in_review') {
        toast({ variant: 'warning', title: moderation.message });
        return true;
      }
      toast({
        variant: 'destructive',
        title: 'Revise seu comentário',
        description: moderation.message,
      });
      return false;
    } catch (err) {
      const ax = err as { response?: { data?: { error?: string }; status?: number } };
      toast({
        variant: 'destructive',
        title: ax?.response?.status === 403 ? 'Ação não permitida' : 'Erro ao publicar',
        description: ax?.response?.data?.error || 'Verifique sua conexão e tente novamente.',
      });
      return false;
    }
  };

  const total = data?.total ?? 0;
  const comments = data?.comments ?? [];

  const body = (
    <div className={cn('space-y-4', !embedded && 'px-4 py-4 sm:px-5')}>
      <p className="text-xs text-muted-foreground sm:text-sm">{COMMENT_GUIDANCE}</p>

      <CommentForm
        ariaLabel="Escrever um comentário"
        placeholder="Compartilhe sua opinião sobre a aula..."
        onSubmit={handleCreate}
        compact
      />

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {total} {total === 1 ? 'comentário' : 'comentários'}
        </span>
        <div className="flex items-center gap-1" role="group" aria-label="Ordenar comentários">
          <SortButton active={sort === 'recent'} onClick={() => handleSortChange('recent')}>
            Mais recentes
          </SortButton>
          <SortButton active={sort === 'oldest'} onClick={() => handleSortChange('oldest')}>
            Mais antigos
          </SortButton>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Carregando comentários...
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <AlertCircle className="h-6 w-6 text-destructive" aria-hidden />
          <p className="text-sm text-muted-foreground">Não foi possível carregar os comentários.</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <MessageSquare className="h-7 w-7 text-muted-foreground/40" aria-hidden />
          <p className="text-sm font-medium text-foreground">Ainda não há comentários</p>
          <p className="text-xs text-muted-foreground">
            Seja o primeiro a compartilhar sua opinião sobre esta aula.
          </p>
        </div>
      ) : (
        <div
          className={cn(
            'space-y-4 overflow-y-auto overscroll-y-contain pr-1',
            embedded ? 'max-h-[32rem]' : 'max-h-[28rem]',
            isFetching && 'opacity-70',
          )}
        >
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              lessonId={lessonId}
              comment={comment}
              isStaff={isStaff}
            />
          ))}
        </div>
      )}

      {!isLoading && !isError && (page > 1 || data?.hasMore) && (
        <div className="flex items-center justify-between border-t border-border pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anteriores
          </Button>
          <span className="text-xs text-muted-foreground">Página {page}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!data?.hasMore || isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Mais comentários
          </Button>
        </div>
      )}
    </div>
  );

  if (embedded) {
    return (
      <section className="min-w-0" aria-label="Comentários da aula">
        {body}
      </section>
    );
  }

  return (
    <section className="mt-8 min-w-0" aria-labelledby="lesson-comments-heading">
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" aria-hidden />
            <h2
              id="lesson-comments-heading"
              className="font-display text-base font-semibold text-card-foreground sm:text-lg"
            >
              Comentários
            </h2>
            <span className="text-sm text-muted-foreground">({total})</span>
          </div>
        </div>
        {body}
      </div>
    </section>
  );
}

function SortButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}
