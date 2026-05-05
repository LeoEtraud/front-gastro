import { Fragment } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ResetTimelineStepStatus = 'done' | 'active' | 'todo' | 'error';

const STEP_LABELS = [
  'Solicitação do e-mail',
  'Verificação do link',
  'Definição da nova senha',
  'Senha redefinida',
] as const;

const STEP_SHORT = ['E-mail', 'Link', 'Nova senha', 'Concluído'] as const;

type Props = {
  statuses: [ResetTimelineStepStatus, ResetTimelineStepStatus, ResetTimelineStepStatus, ResetTimelineStepStatus];
};

function StepCircle({ status, index }: { status: ResetTimelineStepStatus; index: number }) {
  const isDone = status === 'done';
  const isActive = status === 'active';
  const isError = status === 'error';

  return (
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors',
        isDone && 'border-primary bg-primary text-primary-foreground',
        isActive && !isError && 'border-primary bg-primary/10 text-primary ring-2 ring-primary/25 ring-offset-2 ring-offset-card',
        isError && 'border-destructive bg-destructive/10 text-destructive',
        status === 'todo' && 'border-muted-foreground/25 bg-muted/50 text-muted-foreground',
      )}
      aria-current={isActive ? 'step' : undefined}
    >
      {isDone ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <span>{index + 1}</span>}
    </div>
  );
}

function lineBetween(prev: ResetTimelineStepStatus, next: ResetTimelineStepStatus): string {
  if (prev === 'error' || next === 'error') return 'bg-destructive/35';
  if (prev === 'done') return 'bg-primary/45';
  return 'bg-border';
}

// LINHA DO TEMPO DO FLUXO DE REDEFINIÇÃO DE SENHA (4 etapas)
export function PasswordResetTimeline({ statuses }: Props) {
  return (
    <nav className="w-full" aria-label="Etapas da redefinição de senha">
      <div className="flex w-full items-center">
        {STEP_LABELS.map((fullLabel, i) => (
          <Fragment key={fullLabel}>
            {i > 0 && (
              <div
                className={cn(
                  'h-0.5 w-2 shrink-0 sm:w-5',
                  lineBetween(statuses[i - 1], statuses[i]),
                )}
                aria-hidden
              />
            )}
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5 px-0.5">
              <StepCircle status={statuses[i]} index={i} />
              <div className="w-full text-center">
                <p className="text-[10px] font-medium leading-tight text-foreground sm:text-xs">{STEP_SHORT[i]}</p>
                <p className="mt-0.5 hidden text-[10px] leading-snug text-muted-foreground sm:line-clamp-2 sm:block">
                  {fullLabel}
                </p>
              </div>
            </div>
          </Fragment>
        ))}
      </div>
      <ul className="mt-3 space-y-1.5 border-t border-border/60 pt-3 sm:hidden">
        {STEP_LABELS.map((label, i) => (
          <li key={label} className="flex items-start gap-2 text-xs">
            <span className="mt-0.5 shrink-0 font-medium text-muted-foreground">{i + 1}.</span>
            <span
              className={cn(
                statuses[i] === 'done' && 'text-primary',
                statuses[i] === 'active' && 'font-semibold text-foreground',
                statuses[i] === 'error' && 'font-medium text-destructive',
                statuses[i] === 'todo' && 'text-muted-foreground',
              )}
            >
              {label}
            </span>
          </li>
        ))}
      </ul>
    </nav>
  );
}
