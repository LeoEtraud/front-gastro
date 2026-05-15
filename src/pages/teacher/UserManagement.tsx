import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAllUsers, useActivateUser, useDeactivateUser } from '@/hooks/use-coordinator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useDelayedFlag } from '@/hooks/use-delayed-flag';
import { Search, UserCheck, UserX, Clock, CheckCircle2, Users } from 'lucide-react';
import { ManagedUser } from '@/types/api';
import { formatCpf, formatPhoneBR } from '@/lib/profile-formatters';
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
      {role === 'ADMIN' ? 'Administrador' : role === 'TEACHER' ? 'Professor' : 'Estudante'}
    </Badge>
  );
}

export default function UserManagement() {
  const { data: users = [], isLoading } = useAllUsers();
  const activateUser = useActivateUser();
  const deactivateUser = useDeactivateUser();
  const showLoading = useDelayedFlag(isLoading);
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [actionTarget, setActionTarget] = useState<{ user: ManagedUser; action: 'activate' | 'deactivate' } | null>(null);

  const filtered = users.filter((u) => {
    const matchesStatus =
      filterStatus === 'ALL' || u.status === filterStatus;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.cpf ?? '').includes(q);
    return matchesStatus && matchesSearch;
  });

  const pendingCount = users.filter((u) => u.status === 'PENDING').length;

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
            ? 'E-mail de criação de senha enviado com sucesso.'
            : 'Usuário ativado, mas o e-mail não pôde ser enviado. Verifique as configurações de e-mail.',
        });
      } else {
        await deactivateUser.mutateAsync(user.id);
        toast({ variant: 'success', title: `Acesso de ${user.name} suspenso.` });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao processar solicitação.' });
    } finally {
      setActionTarget(null);
    }
  };

  const isWorking = activateUser.isPending || deactivateUser.isPending;

  return (
    <AppLayout>
      <div className="mx-auto max-w-[92rem] min-w-0 space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <p className="mb-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">Professor</p>
            <div className="inline-flex w-fit flex-col gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Gestão de Usuários</h1>
              <div className="h-1 w-full rounded-full bg-primary/80" />
            </div>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Habilite ou suspenda o acesso de alunos e professores à plataforma.
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
            {filtered.map((user) => (
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
                  <div className="flex shrink-0 gap-2">
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
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full gap-1.5 border-destructive/30 text-destructive hover:border-destructive hover:bg-destructive hover:text-destructive-foreground focus-visible:ring-destructive sm:w-auto"
                        disabled={isWorking}
                        onClick={() => setActionTarget({ user, action: 'deactivate' })}
                      >
                        <UserX className="h-4 w-4" /> Suspender
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!actionTarget} onOpenChange={(open) => !open && setActionTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionTarget?.action === 'activate' ? 'Habilitar usuário' : 'Suspender acesso'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionTarget?.action === 'activate'
                ? `Ao habilitar ${actionTarget?.user.name}, o sistema enviará automaticamente um e-mail com o link para criação de senha. O usuário poderá acessar a plataforma após criar a senha.`
                : `Ao suspender ${actionTarget?.user.name}, o acesso à plataforma será bloqueado imediatamente. A conta não será excluída.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                actionTarget?.action === 'activate'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-destructive hover:bg-destructive/90'
              }
            >
              {actionTarget?.action === 'activate' ? 'Habilitar e enviar e-mail' : 'Suspender acesso'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
