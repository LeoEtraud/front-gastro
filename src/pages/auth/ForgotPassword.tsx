import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordResetTimeline, type ResetTimelineStepStatus } from '@/components/auth/PasswordResetTimeline';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { ArrowLeft } from 'lucide-react';

/* ── campo de input padrão das páginas de auth ── */
const authField =
  'h-12 rounded-[11px] border border-[#D8DEE8] bg-[#F7F9FC] px-4 text-[14.5px] text-gc-text placeholder:text-slate-400 shadow-none transition-[border-color,box-shadow] duration-150 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:bg-white focus-visible:ring-offset-0 aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus-visible:ring-red-300/30';

const schema = z.object({
  email: z.string().email('Email inválido'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const timelineStatuses = useMemo(
    (): [
      ResetTimelineStepStatus,
      ResetTimelineStepStatus,
      ResetTimelineStepStatus,
      ResetTimelineStepStatus,
    ] => (successMsg ? ['done', 'active', 'todo', 'todo'] : ['active', 'todo', 'todo', 'todo']),
    [successMsg],
  );

  const onSubmit = async (data: FormValues) => {
    try {
      setErrorMsg('');
      setSuccessMsg('');
      const res = await api.post<{ message: string }>('/auth/forgot-password', { email: data.email });
      setSuccessMsg(
        res.data.message || 'Se existir uma conta com este e-mail, você receberá as instruções.',
      );
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Não foi possível enviar o e-mail. Tente novamente.';
      setErrorMsg(msg);
    }
  };

  return (
    <AuthLayout
      heroBg={`${import.meta.env.BASE_URL}images/doctor-abstract.png`}
      heroTitle="Redefinir sua senha"
      heroSubtitle="Informe o e-mail da sua conta e enviaremos um link seguro para você criar uma nova senha."
    >
      {/* ── Card ── */}
      <div className="w-full rounded-[22px] border border-[#E2E8F4] bg-white px-6 py-8 shadow-[0_8px_40px_rgba(7,27,53,0.09),0_1px_4px_rgba(7,27,53,0.05)] sm:px-8 sm:py-10">

        {/* Logo mobile (só aparece em mobile, hero já mostra no desktop) */}
        <div className="mb-6 flex justify-center md:hidden">
          <img
            src="/logo-login.png"
            alt="GastroCentro"
            className="h-auto w-full max-w-[160px] object-contain"
          />
        </div>

        {/* Heading */}
        <div className="mb-7 text-center">
          <h1 className="font-display text-[28px] font-bold tracking-tight text-gc-text">
            Esqueci minha senha
          </h1>
          <p className="mt-1.5 text-[14px] leading-relaxed text-slate-500">
            Digite o e-mail cadastrado na GastroCentro.
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-7 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-4">
          <PasswordResetTimeline statuses={timelineStatuses} />
        </div>

        {/* Alertas */}
        {errorMsg && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm text-red-600"
          >
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-800"
          >
            {successMsg}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[13px] font-semibold text-slate-700">E-mail</label>
            <Input
              {...register('email')}
              placeholder="seu@email.com"
              className={authField}
              type="email"
              autoComplete="email"
            />
            {errors.email && (
              <p role="alert" className="text-[12px] text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-[11px] text-[15px] font-semibold tracking-wide shadow-[0_2px_10px_rgba(30,144,232,0.22)] transition-all duration-200 hover:brightness-[1.06] hover:shadow-[0_4px_16px_rgba(30,144,232,0.30)] active:scale-[0.99]"
            isLoading={isSubmitting}
          >
            Enviar link por e-mail
          </Button>
        </form>

        {/* Rodapé */}
        <div className="mt-6 border-t border-slate-100 pt-5 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-primary transition-colors hover:text-primary/80 hover:underline underline-offset-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Voltar ao login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
