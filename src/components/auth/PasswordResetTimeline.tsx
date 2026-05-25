import { Fragment } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ResetTimelineStepStatus = 'done' | 'active' | 'todo' | 'error';

const STEP_LABELS = [
  'Solicitar e-mail',
  'Verificar link',
  'Nova senha',
  'Concluído',
] as const;

type Props = {
  statuses: [ResetTimelineStepStatus, ResetTimelineStepStatus, ResetTimelineStepStatus, ResetTimelineStepStatus];
};

function StepCircle({ status, index }: { status: ResetTimelineStepStatus; index: number }) {
  const isDone = status === 'done';
  const isActive = status === 'active';
  const isError = status === 'error';
  const isTodo = status === 'todo';

  return (
    <div
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-300',
        isDone &&
          'border-2 border-primary bg-primary text-white shadow-[0_0_0_3px_rgba(30,144,232,0.15)]',
        isActive &&
          'border-2 border-primary bg-white text-primary shadow-[0_0_0_3px_rgba(30,144,232,0.18)]',
        isError && 'border-2 border-red-400 bg-red-50 text-red-500',
        isTodo && 'border border-slate-200 bg-white text-slate-400',
      )}
      aria-current={isActive ? 'step' : undefined}
    >
      {isDone ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : <span>{index + 1}</span>}
    </div>
  );
}

function connectorColor(prev: ResetTimelineStepStatus, next: ResetTimelineStepStatus): string {
  if (prev === 'error' || next === 'error') return 'bg-red-300/40';
  if (prev === 'done') return 'bg-primary/35';
  return 'bg-slate-200';
}

export function PasswordResetTimeline({ statuses }: Props) {
  return (
    <nav aria-label="Etapas da redefinição de senha" className="w-full">
      <div className="flex w-full items-center justify-between">
        {STEP_LABELS.map((label, i) => (
          <Fragment key={label}>
            {/* Linha conectora */}
            {i > 0 && (
              <div
                aria-hidden
                className={cn(
                  'h-px flex-1 transition-colors duration-300',
                  connectorColor(statuses[i - 1], statuses[i]),
                )}
              />
            )}

            {/* Etapa */}
            <div className="flex flex-col items-center gap-1.5">
              <StepCircle status={statuses[i]} index={i} />
              <span
                className={cn(
                  'max-w-[56px] text-center text-[10.5px] leading-snug transition-colors duration-300',
                  statuses[i] === 'done' && 'font-medium text-primary',
                  statuses[i] === 'active' && 'font-semibold text-gc-text',
                  statuses[i] === 'error' && 'font-medium text-red-500',
                  statuses[i] === 'todo' && 'text-slate-400',
                )}
              >
                {label}
              </span>
            </div>
          </Fragment>
        ))}
      </div>
    </nav>
  );
}
