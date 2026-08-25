import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordResetTimeline, type ResetTimelineStepStatus } from '@/components/auth/PasswordResetTimeline';
import { PasswordStrengthHints } from '@/components/auth/PasswordStrengthHints';
import { resetPasswordMeetsAllCriteria } from '@/lib/password-reset-criteria';

const passwordField = z
  .string()
  .min(1, 'Digite a nova senha')
  .refine(resetPasswordMeetsAllCriteria, 'Atenda a todos os critérios de senha indicados abaixo.');

const schema = z
  .object({
    password: passwordField,
    confirmPassword: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas devem ser iguais',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams]);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [tokenChecked, setTokenChecked] = useState(false);
  const [tokenOk, setTokenOk] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const passwordValue = watch('password');
  const confirmPasswordValue = watch('confirmPassword');

  const timelineStatuses = useMemo((): [
    ResetTimelineStepStatus,
    ResetTimelineStepStatus,
    ResetTimelineStepStatus,
    ResetTimelineStepStatus,
  ] => {
    if (successMsg) {
      return ['done', 'done', 'done', 'done'];
    }
    if (!token) {
      return ['active', 'todo', 'todo', 'todo'];
    }
    if (!tokenChecked) {
      return ['done', 'active', 'todo', 'todo'];
    }
    if (!tokenOk) {
      return ['done', 'error', 'todo', 'todo'];
    }
    return ['done', 'done', 'active', 'todo'];
  }, [successMsg, token, tokenChecked, tokenOk]);

  useEffect(() => {
    if (!token) {
      setTokenChecked(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setErrorMsg('');
        await api.post('/auth/verify-reset-token', { token });
        if (!cancelled) {
          setTokenOk(true);
        }
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (!cancelled) {
          if (status === 400) {
            setTokenOk(false);
            setErrorMsg('Este link expirou ou já foi usado. Use Esqueci minha senha para receber um novo.');
          } else {
            setTokenOk(true);
          }
        }
      } finally {
        if (!cancelled) {
          setTokenChecked(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const canSubmit =
    Boolean(token) &&
    tokenOk &&
    resetPasswordMeetsAllCriteria(passwordValue) &&
    passwordValue === confirmPasswordValue &&
    confirmPasswordValue.length > 0;

  const onSubmit = async (data: FormValues) => {
    if (!token) {
      setErrorMsg('Link inválido ou incompleto. Solicite um novo e-mail de redefinição.');
      return;
    }
    try {
      setErrorMsg('');
      setSuccessMsg('');
      await api.post('/auth/reset-password', { token, password: data.password });
      setSuccessMsg('Senha alterada com sucesso. Você já pode entrar com a nova senha.');
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Não foi possível redefinir a senha. O link pode ter expirado.';
      setErrorMsg(msg);
    }
  };

  return (
    <div className="grid min-h-dvh overflow-x-hidden bg-slate-50 md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-center items-center p-12 bg-sidebar text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img src={`${import.meta.env.BASE_URL}images/doctor-abstract.png`} alt="Medical" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-md text-center">
          <img
            src="/logo-menu-login.png"
            alt="Gastrocentro"
            className="mx-auto mb-4 h-[110px] w-[110px] object-contain"
            width={110}
            height={110}
          />
          <h2 className="text-4xl font-display font-bold mb-4 text-white">Nova senha</h2>
          <p className="text-lg text-white">Escolha uma senha forte e guarde em local seguro.</p>
        </div>
      </div>

      <div className="flex min-w-0 items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md border-slate-200 shadow-xl">
          <CardHeader className="space-y-4 pt-6 text-center sm:pt-8">
            <div className="flex justify-center pb-3">
              <img
                src="/logo-menu-login.png"
                alt="Gastrocentro"
                className="h-[110px] w-[110px] object-contain"
                width={110}
                height={110}
              />
            </div>
            <CardTitle className="font-display text-2xl font-bold sm:text-3xl">Redefinir senha</CardTitle>
            <CardDescription className="pt-1">
              Siga as etapas abaixo. Os critérios da senha são validados em tempo real enquanto você digita.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-5 border-b border-border/60 pb-5">
              <PasswordResetTimeline statuses={timelineStatuses} />
            </div>
            {!token ? (
              <div className="p-4 text-sm text-amber-800 bg-amber-50 rounded-md border border-amber-100">
                Este link não contém um token válido.{' '}
                <Link to="/forgot-password" className="font-semibold text-primary hover:underline">
                  Solicitar novo link
                </Link>
              </div>
            ) : !tokenChecked ? (
              <p className="text-sm text-slate-600 text-center py-8">Verificando link…</p>
            ) : !tokenOk ? (
              <div className="p-4 text-sm text-amber-800 bg-amber-50 rounded-md border border-amber-100">
                {errorMsg || 'Este link expirou ou já foi usado.'}{' '}
                <Link to="/forgot-password" className="font-semibold text-primary hover:underline">
                  Solicitar novo link
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {errorMsg && (
                  <div className="p-4 text-sm text-red-600 bg-red-50 rounded-md border border-red-100">
                    {errorMsg}
                  </div>
                )}
                {successMsg && (
                  <div className="p-4 text-sm text-green-800 bg-green-50 rounded-md border border-green-100 space-y-4">
                    <p>{successMsg}</p>
                    <Link
                      to="/login"
                      className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground touch-manipulation"
                    >
                      Ir para o login
                    </Link>
                  </div>
                )}
                {!successMsg && (
                  <>
                    <div className="space-y-2.5">
                      <label className="text-sm font-medium">Nova senha</label>
                      <PasswordInput {...register('password')} placeholder="••••••••" className="sm:h-12" autoComplete="new-password" />
                      {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                    </div>
                    <div className="space-y-2.5">
                      <label className="text-sm font-medium">Confirmar nova senha</label>
                      <PasswordInput
                        {...register('confirmPassword')}
                        placeholder="••••••••"
                        className="sm:h-12"
                        autoComplete="new-password"
                      />
                      {errors.confirmPassword && (
                        <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                    <PasswordStrengthHints password={passwordValue} confirmPassword={confirmPasswordValue} />
                    <Button
                      type="submit"
                      className="w-full text-base sm:h-12 sm:text-lg"
                      isLoading={isSubmitting}
                      disabled={!canSubmit}
                    >
                      Salvar nova senha
                    </Button>
                  </>
                )}
              </form>
            )}
          </CardContent>
          {!successMsg && (
            <CardFooter className="flex flex-col gap-3 pt-7 pb-8 text-center">
              <p className="text-sm text-slate-600">
                <Link to="/login" className="text-primary hover:underline font-semibold">
                  Voltar ao login
                </Link>
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
