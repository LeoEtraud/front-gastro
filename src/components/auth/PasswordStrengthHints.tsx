import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getResetPasswordCriteria } from '@/lib/password-reset-criteria';

type Props = {
  password: string;
  confirmPassword: string;
};

// LISTA DE CRITÉRIOS DE SENHA COM FEEDBACK EM TEMPO REAL (FLUXO DE REDEFINIÇÃO)
export function PasswordStrengthHints({ password, confirmPassword }: Props) {
  const criteria = getResetPasswordCriteria(password);
  const matchMet =
    password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  return (
    <div
      className="rounded-lg border border-border/80 bg-muted/25 px-3 py-3 sm:px-4"
      role="status"
      aria-live="polite"
    >
      <p className="mb-2.5 text-xs font-medium text-muted-foreground">Critérios da nova senha</p>
      <ul className="space-y-2 text-sm">
        {criteria.map((c) => (
          <li key={c.id} className="flex items-start gap-2.5">
            <span className="mt-0.5 shrink-0" aria-hidden>
              {c.met ? (
                <CheckCircle2 className="h-4 w-4 text-primary" strokeWidth={2} />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/45" strokeWidth={2} />
              )}
            </span>
            <span
              className={cn(
                'leading-snug',
                c.met ? 'font-medium text-foreground' : 'text-muted-foreground',
              )}
            >
              {c.label}
            </span>
          </li>
        ))}
        <li className="flex items-start gap-2.5 border-t border-border/60 pt-2.5">
          <span className="mt-0.5 shrink-0" aria-hidden>
            {matchMet ? (
              <CheckCircle2 className="h-4 w-4 text-primary" strokeWidth={2} />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground/45" strokeWidth={2} />
            )}
          </span>
          <span
            className={cn(
              'leading-snug',
              matchMet ? 'font-medium text-foreground' : 'text-muted-foreground',
            )}
          >
            Confirmação igual à nova senha
          </span>
        </li>
      </ul>
    </div>
  );
}
