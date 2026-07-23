import { useState } from 'react';
import {
  CornerDownRight,
  EyeOff,
  Flag,
  Pencil,
  Reply,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { CreateCommentResponse, LessonCommentDto } from '@/types/api';
import {
  useCreateLessonComment,
  useDeleteLessonComment,
  useEscalateLessonComment,
  useHideLessonComment,
  useUpdateLessonComment,
} from '@/hooks/use-lesson-comments';
import { commentInitials, formatCommentDate, statusLabel } from '@/lib/comment-utils';
import { cn } from '@/lib/utils';
import { CommentForm } from './CommentForm';

function toastFromModeration(
  toast: ReturnType<typeof useToast>['toast'],
  moderation: CreateCommentResponse['moderation'],
) {
  if (moderation.published) {
    toast({ variant: 'success', title: moderation.message });
    return;
  }
  if (moderation.messageKey === 'in_review') {
    toast({ variant: 'warning', title: moderation.message });
    return;
  }
  toast({ variant: 'destructive', title: 'Revise seu comentário', description: moderation.message });
}

type CommentItemProps = {
  lessonId: string;
  comment: LessonCommentDto;
  isStaff: boolean;
  isReply?: boolean;
};

export function CommentItem({ lessonId, comment, isStaff, isReply = false }: CommentItemProps) {
  const { toast } = useToast();
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const createReply = useCreateLessonComment(lessonId);
  const updateComment = useUpdateLessonComment(lessonId);
  const deleteComment = useDeleteLessonComment(lessonId);
  const hideComment = useHideLessonComment(lessonId);
  const escalateComment = useEscalateLessonComment(lessonId);

  const handleReply = async (text: string): Promise<boolean> => {
    try {
      const res = await createReply.mutateAsync({ text, parentCommentId: comment.id });
      toastFromModeration(toast, res.moderation);
      if (res.moderation.published || res.moderation.messageKey === 'in_review') {
        setReplying(false);
        return true;
      }
      return false;
    } catch (err) {
      showError(err);
      return false;
    }
  };

  const handleEdit = async (text: string): Promise<boolean> => {
    try {
      const res = await updateComment.mutateAsync({ commentId: comment.id, text });
      toastFromModeration(toast, res.moderation);
      if (res.moderation.published || res.moderation.messageKey === 'in_review') {
        setEditing(false);
        return true;
      }
      return false;
    } catch (err) {
      showError(err);
      return false;
    }
  };

  const showError = (err: unknown) => {
    const ax = err as { response?: { data?: { error?: string } } };
    toast({
      variant: 'destructive',
      title: 'Não foi possível concluir',
      description: ax?.response?.data?.error || 'Verifique sua conexão e tente novamente.',
    });
  };

  const handleDelete = async () => {
    try {
      await deleteComment.mutateAsync(comment.id);
      toast({ variant: 'success', title: 'Comentário excluído.' });
    } catch (err) {
      showError(err);
    } finally {
      setConfirmDelete(false);
    }
  };

  const handleHide = async () => {
    try {
      await hideComment.mutateAsync({ commentId: comment.id });
      toast({ variant: 'success', title: 'Comentário ocultado.' });
    } catch (err) {
      showError(err);
    }
  };

  const handleEscalate = async () => {
    try {
      await escalateComment.mutateAsync({ commentId: comment.id });
      toast({ variant: 'success', title: 'Encaminhado para moderação.' });
    } catch (err) {
      showError(err);
    }
  };

  const isPending = comment.status === 'pending_review' || comment.status === 'edit_requested';

  return (
    <div className={cn('flex gap-3', isReply && 'ml-4 sm:ml-6')}>
      {isReply && (
        <CornerDownRight className="mt-3 h-4 w-4 shrink-0 text-muted-foreground/60" aria-hidden />
      )}
      <Avatar className="mt-0.5 h-9 w-9 shrink-0">
        {comment.author.avatarUrl && (
          <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
        )}
        <AvatarFallback className="bg-slate-200 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">
          {commentInitials(comment.author.name)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2.5">
          <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold text-foreground">{comment.author.name}</span>
            {comment.isTeacher && (
              <Badge variant="default" className="gap-1">
                <ShieldCheck className="h-3 w-3" aria-hidden /> Professor
              </Badge>
            )}
            {comment.isModerator && (
              <Badge variant="secondary" className="gap-1">
                <ShieldCheck className="h-3 w-3" aria-hidden /> Moderador
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatCommentDate(comment.createdAt)}
            </span>
            {comment.isEdited && (
              <span className="text-xs italic text-muted-foreground">(editado)</span>
            )}
            {isPending && (
              <Badge variant="warning">{statusLabel(comment.status)}</Badge>
            )}
          </div>

          {editing ? (
            <CommentForm
              ariaLabel="Editar comentário"
              initialValue={comment.text}
              submitLabel="Salvar"
              autoFocus
              compact
              onSubmit={handleEdit}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <p className="whitespace-pre-wrap break-words text-sm text-foreground/90">
              {comment.text}
            </p>
          )}
        </div>

        {!editing && (
          <div className="mt-1 flex flex-wrap items-center gap-1">
            {comment.canReply && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-xs text-muted-foreground"
                onClick={() => setReplying((v) => !v)}
              >
                <Reply className="h-3.5 w-3.5" aria-hidden /> Responder
              </Button>
            )}
            {comment.canEdit && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-xs text-muted-foreground"
                onClick={() => setEditing(true)}
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden /> Editar
              </Button>
            )}
            {comment.canDelete && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-xs text-destructive hover:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden /> Excluir
              </Button>
            )}
            {isStaff && comment.status === 'published' && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 px-2 text-xs text-muted-foreground"
                  onClick={() => void handleHide()}
                  disabled={hideComment.isPending}
                >
                  <EyeOff className="h-3.5 w-3.5" aria-hidden /> Ocultar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 px-2 text-xs text-muted-foreground"
                  onClick={() => void handleEscalate()}
                  disabled={escalateComment.isPending}
                >
                  <Flag className="h-3.5 w-3.5" aria-hidden /> Encaminhar
                </Button>
              </>
            )}
          </div>
        )}

        {replying && (
          <div className="mt-2">
            <CommentForm
              ariaLabel="Escrever resposta"
              placeholder="Escreva uma resposta..."
              submitLabel="Responder"
              autoFocus
              compact
              onSubmit={handleReply}
              onCancel={() => setReplying(false)}
            />
          </div>
        )}

        {comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                lessonId={lessonId}
                comment={reply}
                isStaff={isStaff}
                isReply
              />
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir comentário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O comentário deixará de aparecer para os alunos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                void handleDelete();
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
