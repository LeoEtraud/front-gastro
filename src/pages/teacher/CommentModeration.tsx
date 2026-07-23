import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useDelayedFlag } from '@/hooks/use-delayed-flag';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  EyeOff,
  History,
  MessageSquare,
  MessageSquareWarning,
  Pencil,
  ShieldBan,
  Trash2,
} from 'lucide-react';
import type { CommentRiskLevel, PendingComment } from '@/types/api';
import {
  useCommentModerationHistory,
  useModerateComment,
  usePendingComments,
  useRestrictUser,
  type ModerationActionType,
} from '@/hooks/use-comment-moderation';
import { formatCommentDate, riskLabel } from '@/lib/comment-utils';
import { CompactContentSkeleton, UserManagementCardsSkeleton } from '@/components/ui/content-skeletons';
import { cn } from '@/lib/utils';

type RiskFilter = CommentRiskLevel | 'all';

const CATEGORY_LABELS: Record<string, string> = {
  empty: 'Vazio',
  too_long: 'Muito longo',
  excessive_links: 'Excesso de links',
  excessive_repetition: 'Repetição',
  spam: 'Spam',
  offensive: 'Linguagem ofensiva',
  possible_personal_data: 'Possíveis dados pessoais',
  possible_patient_data: 'Possíveis dados de paciente',
  threat: 'Ameaça',
  personal_attack: 'Ataque pessoal',
  discriminatory: 'Discurso discriminatório',
};

function RiskBadge({ level }: { level: CommentRiskLevel }) {
  if (level === 'high') {
    return (
      <Badge className="gap-1 bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-300">
        Risco {riskLabel(level)}
      </Badge>
    );
  }
  if (level === 'medium') {
    return (
      <Badge className="gap-1 bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300">
        Risco {riskLabel(level)}
      </Badge>
    );
  }
  return (
    <Badge className="gap-1 bg-slate-100 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300">
      Risco {riskLabel(level)}
    </Badge>
  );
}

type DialogAction =
  | { type: 'moderate'; action: ModerationActionType; requireReason: boolean; title: string }
  | { type: 'restrict' }
  | null;

export default function CommentModeration() {
  const [risk, setRisk] = useState<RiskFilter>('all');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, isFetching, refetch } = usePendingComments({
    page,
    riskLevel: risk,
  });
  const showLoading = useDelayedFlag(isLoading);

  const setFilter = (next: RiskFilter) => {
    setRisk(next);
    setPage(1);
  };

  const comments = data?.comments ?? [];
  const pendingCount = data?.total ?? 0;

  return (
    <AppLayout>
      <div className="mx-auto max-w-[92rem] min-w-0 space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="inline-flex w-fit flex-col gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Moderação de Comentários
              </h1>
              <div className="h-1 w-full rounded-full bg-primary/80" />
            </div>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Revise os comentários aguardando análise. Comentários de risco alto aparecem primeiro.
            </p>
          </div>
          {pendingCount > 0 && (
            <Badge className="h-8 shrink-0 gap-1.5 self-start bg-amber-500 text-white hover:bg-amber-500 sm:self-auto sm:text-sm">
              <Clock className="h-4 w-4" />
              {pendingCount} {pendingCount === 1 ? 'pendente' : 'pendentes'}
            </Badge>
          )}
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5">
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Filtrar por risco"
            >
              {(['all', 'high', 'medium', 'low'] as RiskFilter[]).map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={risk === option ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(option)}
                >
                  {option === 'all' ? 'Todos' : `Risco ${riskLabel(option as CommentRiskLevel)}`}
                </Button>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {pendingCount} {pendingCount === 1 ? 'comentário na fila' : 'comentários na fila'}
            </span>
          </CardContent>
        </Card>

        {/* Conteúdo */}
        {isLoading && showLoading ? (
          <UserManagementCardsSkeleton />
        ) : isLoading ? (
          <CompactContentSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center sm:py-20">
            <AlertCircle className="mb-3 h-10 w-10 text-destructive/70" />
            <p className="font-medium text-muted-foreground">
              Não foi possível carregar a fila de moderação.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => void refetch()}
            >
              Tentar novamente
            </Button>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center sm:py-20">
            <MessageSquare className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium text-muted-foreground">Nenhum comentário pendente.</p>
            <p className="mt-1 text-sm text-muted-foreground">A fila de moderação está vazia.</p>
          </div>
        ) : (
          <div className={cn('space-y-3', isFetching && 'opacity-70')}>
            {comments.map((comment) => (
              <PendingCommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        )}

        {!isLoading && !isError && (page > 1 || data?.hasMore) && (
          <div className="flex items-center justify-between gap-3">
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
              Próximos
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function PendingCommentCard({ comment }: { comment: PendingComment }) {
  const { toast } = useToast();
  const moderate = useModerateComment();
  const restrict = useRestrictUser();
  const [dialog, setDialog] = useState<DialogAction>(null);
  const [reason, setReason] = useState('');
  const [durationHours, setDurationHours] = useState('24');
  const [showHistory, setShowHistory] = useState(false);

  const closeDialog = () => {
    setDialog(null);
    setReason('');
  };

  const busy = moderate.isPending || restrict.isPending;
  const requiresReason =
    dialog?.type === 'restrict' || (dialog?.type === 'moderate' && dialog.requireReason);

  const handleConfirm = async () => {
    if (!dialog) return;
    try {
      if (dialog.type === 'moderate') {
        if (dialog.requireReason && !reason.trim()) {
          toast({ variant: 'destructive', title: 'Justificativa obrigatória' });
          return;
        }
        await moderate.mutateAsync({
          commentId: comment.id,
          action: dialog.action,
          reason: reason.trim() || undefined,
        });
        toast({ variant: 'success', title: 'Ação registrada.' });
      } else {
        if (!reason.trim()) {
          toast({ variant: 'destructive', title: 'Justificativa obrigatória' });
          return;
        }
        const hours = Number(durationHours);
        await restrict.mutateAsync({
          userId: comment.author.id,
          reason: reason.trim(),
          durationHours: Number.isFinite(hours) && hours > 0 ? hours : null,
        });
        toast({ variant: 'success', title: 'Usuário restrito temporariamente.' });
      }
      closeDialog();
    } catch (err) {
      const ax = err as { response?: { data?: { error?: string } } };
      toast({
        variant: 'destructive',
        title: 'Erro ao processar solicitação.',
        description: ax?.response?.data?.error || 'Tente novamente.',
      });
    }
  };

  return (
    <>
      <Card className="border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
        <CardContent className="space-y-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <RiskBadge level={comment.riskLevel} />
            {comment.status === 'edit_requested' && (
              <Badge variant="outline">Edição solicitada</Badge>
            )}
            {comment.parentCommentId && <Badge variant="outline">Resposta</Badge>}
            {comment.moderationCategories.map((category) => (
              <Badge key={category} variant="outline" className="text-[11px]">
                {CATEGORY_LABELS[category] ?? category}
              </Badge>
            ))}
            <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" aria-hidden /> {formatCommentDate(comment.createdAt)}
            </span>
          </div>

          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-card-foreground">{comment.courseTitle ?? 'Curso'}</span>
            {comment.lessonTitle && <> · {comment.lessonTitle}</>}
          </div>

          <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-card-foreground">{comment.author.name}</span>
              <span className="text-xs text-muted-foreground">{comment.author.email}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Histórico: {comment.authorHistory.total} comentário(s) · {comment.authorHistory.pending}{' '}
              pendente(s) · {comment.authorHistory.hidden} oculto(s) · {comment.authorHistory.removed}{' '}
              removido(s)
            </p>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Texto atual
              </p>
              <p className="whitespace-pre-wrap break-words text-sm text-card-foreground/90">
                {comment.currentText}
              </p>
            </div>
            {comment.isEdited && comment.originalText !== comment.currentText && (
              <details className="text-sm">
                <summary className="cursor-pointer text-xs font-medium text-muted-foreground">
                  Ver texto original
                </summary>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                  {comment.originalText}
                </p>
              </details>
            )}
          </div>

          <div className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:flex-wrap">
            <Button
              size="sm"
              className="w-full gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto"
              disabled={busy}
              onClick={() =>
                setDialog({
                  type: 'moderate',
                  action: 'approve',
                  requireReason: false,
                  title: 'Aprovar comentário',
                })
              }
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden /> Aprovar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-1.5 sm:w-auto"
              disabled={busy}
              onClick={() =>
                setDialog({
                  type: 'moderate',
                  action: 'request-edit',
                  requireReason: false,
                  title: 'Solicitar edição',
                })
              }
            >
              <Pencil className="h-4 w-4" aria-hidden /> Solicitar edição
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-1.5 border-amber-500/40 text-amber-700 hover:border-amber-600 hover:bg-amber-600 hover:text-white dark:text-amber-400 dark:hover:bg-amber-600 dark:hover:text-white sm:w-auto"
              disabled={busy}
              onClick={() =>
                setDialog({
                  type: 'moderate',
                  action: 'hide',
                  requireReason: true,
                  title: 'Ocultar comentário',
                })
              }
            >
              <EyeOff className="h-4 w-4" aria-hidden /> Ocultar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-1.5 border-destructive/30 text-destructive hover:border-destructive hover:bg-destructive hover:text-destructive-foreground sm:w-auto"
              disabled={busy}
              onClick={() =>
                setDialog({
                  type: 'moderate',
                  action: 'remove',
                  requireReason: true,
                  title: 'Remover comentário',
                })
              }
            >
              <Trash2 className="h-4 w-4" aria-hidden /> Remover
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full gap-1.5 border-destructive/30 text-destructive hover:border-destructive hover:bg-destructive hover:text-destructive-foreground sm:w-auto"
              disabled={busy}
              onClick={() => setDialog({ type: 'restrict' })}
            >
              <ShieldBan className="h-4 w-4" aria-hidden /> Restringir usuário
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="w-full gap-1.5 text-muted-foreground sm:ml-auto sm:w-auto"
              onClick={() => setShowHistory((v) => !v)}
            >
              <History className="h-4 w-4" aria-hidden /> Histórico
            </Button>
          </div>

          {showHistory && <ModerationHistory commentId={comment.id} />}
        </CardContent>
      </Card>

      <AlertDialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open && !busy) closeDialog();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <MessageSquareWarning className="h-5 w-5 shrink-0" aria-hidden />
              {dialog?.type === 'restrict' ? 'Restringir direito de comentar' : dialog?.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialog?.type === 'restrict'
                ? 'A suspensão é temporária. O usuário não poderá comentar durante o período definido.'
                : requiresReason
                  ? 'Informe uma justificativa. Ela ficará registrada no histórico de auditoria.'
                  : 'Confirme a ação. A decisão ficará registrada no histórico de auditoria.'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3">
            {dialog?.type === 'restrict' && (
              <div className="space-y-1.5">
                <Label htmlFor="restrict-duration">Duração (horas)</Label>
                <Input
                  id="restrict-duration"
                  type="number"
                  min={1}
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  disabled={busy}
                />
              </div>
            )}
            {(requiresReason || dialog?.type === 'moderate') && (
              <div className="space-y-1.5">
                <Label htmlFor="moderation-reason">
                  Justificativa
                  {requiresReason && <span className="text-destructive"> *</span>}
                </Label>
                <Textarea
                  id="moderation-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Descreva o motivo desta decisão..."
                  rows={3}
                  disabled={busy}
                />
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              className={
                dialog?.type === 'restrict' ||
                (dialog?.type === 'moderate' &&
                  (dialog.action === 'remove' || dialog.action === 'hide'))
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : dialog?.type === 'moderate' && dialog.action === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : undefined
              }
              onClick={(event) => {
                event.preventDefault();
                void handleConfirm();
              }}
            >
              {busy ? 'Processando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ModerationHistory({ commentId }: { commentId: string }) {
  const { data, isLoading } = useCommentModerationHistory(commentId);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border/70 bg-muted/20 p-3 text-xs text-muted-foreground">
        Carregando histórico...
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-border/70 bg-muted/20 p-3 text-xs text-muted-foreground">
        Nenhum registro de moderação.
      </div>
    );
  }
  return (
    <ul className="space-y-2 rounded-lg border border-border/70 bg-muted/20 p-3">
      {data.map((entry) => (
        <li key={entry.id} className="text-xs text-muted-foreground">
          <span className="font-medium text-card-foreground">{entry.action}</span> ·{' '}
          {formatCommentDate(entry.createdAt)}
          {entry.reason ? ` — ${entry.reason}` : ''}
        </li>
      ))}
    </ul>
  );
}
