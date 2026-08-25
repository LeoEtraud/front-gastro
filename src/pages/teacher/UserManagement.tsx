import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import {
  useAllUsers,
  useActivateUser,
  useDeactivateUser,
  useDeleteUser,
  useResendPasswordEmail,
} from '@/hooks/use-coordinator';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useDelayedFlag } from '@/hooks/use-delayed-flag';
import { Search, UserCheck, UserX, Clock, CheckCircle2, Users, Trash2, Mail } from 'lucide-react';
import { ManagedUser } from '@/types/api';
import { formatCpf, formatPhoneBR } from '@/lib/profile-formatters';
import { roleLabel } from '@/lib/permissions';
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
import { CompactContentSkeleton, UserManagementCardsSkeleton } from '@/components/ui/content-skeletons';

type FilterStatus = 'ALL' | 'PENDING' | 'ACTIVE';
type UserAction = 'activate' | 'deactivate' | 'delete' | 'resend';

function StatusBadge({ status }: { status: ManagedUser['status'] }) {
  if (status === 'ACTIVE') {
    return (
      <Badge className="gap-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-300">
        <CheckCircle2 className="h-3 w-3" /> Ativo
      </Badge>
    );
  }
  return (
    <Badge className="gap-1 bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300">
      <Clock className="h-3 w-3" /> Pendente
    </Badge>
  );
}

function RoleBadge({ role }: { role: ManagedUser['role'] }) {
  return (
    <Badge variant="outline" className="text-xs">
      {roleLabel(role)}
    </Badge>
  );
}

function dialogCopy(action: UserAction, userName: string) {
  if (action === 'activate') {
    return {
      title: 'Habilitar usuário',
      description: `Ao habilitar ${userName}, o sistema enviará um e-mail com o link para criação de senha, válido por 24 horas. Se o link expirar, o usuário pode usar Esqueci minha senha na tela de login.`,
      confirmLabel: 'Habilitar e enviar e-mail',
      confirmClass: 'bg-emerald-600 hover:bg-emerald-700',
    };
  }
  if (action === 'resend') {
    return {
      title: 'Reenviar e-mail de senha',
      description: `Um novo link de criação de senha, válido por 24 horas, será enviado para ${userName}. O link anterior deixará de funcionar.`,
      confirmLabel: 'Reenviar e-mail',
      confirmClass: 'bg-sky-600 hover:bg-sky-700',
    };
  }
  if (action === 'deactivate') {
    return {
      title: 'Desabilitar acesso',
      description: `Ao desabilitar ${userName}, o acesso à plataforma será bloqueado imediatamente. A conta não será excluída.`,
      confirmLabel: 'Desabilitar acesso',
      confirmClass: 'bg-amber-600 text-white hover:bg-amber-700',
    };
  }
  return {
    title: 'Excluir usuário',
    description: (
      <>
        Tem certeza que deseja excluir o usuário{' '}
        <span className="font-semibold text-foreground">"{userName}"</span>? Esta ação é permanente e
        removerá a conta, matrículas e progresso associados.
      </>
    ),
    confirmLabel: 'Excluir usuário',
    confirmClass: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };
}

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const { data: users = [], isLoading } = useAllUsers();
  const activateUser = useActivateUser();
  const deactivateUser = useDeactivateUser();
  const deleteUser = useDeleteUser();
  const resendPasswordEmail = useResendPasswordEmail();
  const showLoading = useDelayedFlag(isLoading);
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [actionTarget, setActionTarget] = useState<{ user: ManagedUser; action: UserAction } | null>(
    null,
  );

  const filtered = users.filter((u) => {
    const matchesStatus = filterStatus === 'ALL' || u.status === filterStatus;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.cpf ?? '').includes(q);
    return matchesStatus && matchesSearch;
  });

  const pendingCount = users.filter((u) => u.status === 'PENDING').length;
  const isWorking =
    activateUser.isPending ||
    deactivateUser.isPending ||
    deleteUser.isPending ||
    resendPasswordEmail.isPending;
  const copy = actionTarget ? dialogCopy(actionTarget.action, actionTarget.user.name) : null;

  const handleConfirm = async () => {
    if (!actionTarget) return;
    const { user, action } = actionTarget;
    try {
      if (action === 'activate') {
        const result = await activateUser.mutateAsync(user.id);
        toast({
          variant: 'success',
          title: `${user.name} habilitado`,
          description: result.emailSent
            ? 'E-mail de criação de senha enviado (válido por 24 horas).'
            : 'Usuário ativado, mas o e-mail não pôde ser enviado. Use Reenviar e-mail após corrigir o SMTP.',
        });
      } else if (action === 'resend') {
        const result = await resendPasswordEmail.mutateAsync(user.id);
        toast({
          variant: result.emailSent ? 'success' : 'destructive',
          title: result.emailSent ? 'E-mail reenviado' : 'Não foi possível enviar o e-mail',
          description: result.emailSent
            ? `Novo link enviado para ${user.email}. Válido por 24 horas.`
            : 'Verifique as configurações de e-mail e tente novamente.',
        });
      } else if (action === 'deactivate') {
        await deactivateUser.mutateAsync(user.id);
        toast({ variant: 'success', title: `Acesso de ${user.name} desabilitado.` });
      } else {
        await deleteUser.mutateAsync(user.id);
        toast({
          variant: 'success',
          title: 'Usuário excluído',
          description: `"${user.name}" foi removido com sucesso.`,
        });
      }
      setActionTarget(null);
    } catch (error: unknown) {
      const ax = error as { response?: { data?: { error?: string } } };
      toast({
        variant: 'destructive',
        title:
          action === 'delete'
            ? 'Não foi possível excluir o usuário'
            : action === 'resend'
              ? 'Não foi possível reenviar o e-mail'
              : 'Erro ao processar solicitação.',
        description: ax?.response?.data?.error ?? 'Tente novamente.',
      });
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-[92rem] min-w-0 space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <div className="inline-flex w-fit flex-col gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Gestão de Usuários</h1>
              <div className="h-1 w-full rounded-full bg-primary/80" />
            </div>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Habilite, desabilite ou exclua o acesso de alunos e professores. Usuários ativos podem receber um novo e-mail de senha se o link expirar.
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
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, e-mail ou CPF..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:flex-nowrap">
              {(['ALL', 'PENDING', 'ACTIVE'] as FilterStatus[]).map((s) => (
                <Button
                  key={s}
                  variant={filterStatus === s ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(s)}
                >
                  {s === 'ALL' ? 'Todos' : s === 'PENDING' ? 'Pendentes' : 'Ativos'}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conteúdo */}
        {isLoading && showLoading ? (
          <UserManagementCardsSkeleton />
        ) : isLoading ? (
          <CompactContentSkeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center sm:py-20">
            <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium text-muted-foreground">Nenhum usuário encontrado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((user) => {
              const isSelf = currentUser?.id === user.id;
              return (
                <Card
                  key={user.id}
                  className="border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-card-foreground">{user.name}</span>
                        <StatusBadge status={user.status} />
                        <RoleBadge role={user.role} />
                      </div>
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                        {user.cpf && <span>CPF: {formatCpf(user.cpf)}</span>}
                        {user.phone && <span>Tel: {formatPhoneBR(user.phone)}</span>}
                        <span>Cadastro: {new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                      {user.status === 'PENDING' ? (
                        <Button
                          size="sm"
                          className="w-full gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto"
                          disabled={isWorking}
                          onClick={() => setActionTarget({ user, action: 'activate' })}
                        >
                          <UserCheck className="h-4 w-4" /> Habilitar
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full gap-1.5 sm:w-auto"
                            disabled={isWorking || isSelf}
                            onClick={() => setActionTarget({ user, action: 'resend' })}
                            aria-label={`Reenviar e-mail de senha para ${user.name}`}
                          >
                            <Mail className="h-4 w-4" /> Reenviar e-mail
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full gap-1.5 border-amber-500/40 text-amber-700 hover:border-amber-600 hover:bg-amber-600 hover:text-white focus-visible:ring-amber-500 dark:text-amber-400 dark:hover:bg-amber-600 dark:hover:text-white sm:w-auto"
                            disabled={isWorking || isSelf}
                            onClick={() => setActionTarget({ user, action: 'deactivate' })}
                          >
                            <UserX className="h-4 w-4" /> Desabilitar
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full gap-1.5 border-destructive/30 text-destructive hover:border-destructive hover:bg-destructive hover:text-destructive-foreground focus-visible:ring-destructive sm:w-auto"
                        disabled={isWorking || isSelf}
                        onClick={() => setActionTarget({ user, action: 'delete' })}
                        aria-label={`Excluir usuário ${user.name}`}
                      >
                        <Trash2 className="h-4 w-4" /> Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog
        open={!!actionTarget}
        onOpenChange={(open) => {
          if (!open && !isWorking) setActionTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{copy?.title}</AlertDialogTitle>
            <AlertDialogDescription>{copy?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isWorking}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className={copy?.confirmClass}
              disabled={isWorking}
              onClick={(event) => {
                event.preventDefault();
                void handleConfirm();
              }}
            >
              {isWorking
                ? actionTarget?.action === 'delete'
                  ? 'Excluindo...'
                  : actionTarget?.action === 'resend'
                    ? 'Enviando...'
                    : 'Processando...'
                : copy?.confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
