import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordResetTimeline, type ResetTimelineStepStatus } from '@/components/auth/PasswordResetTimeline';
import { BookOpen, Stethoscope } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Email inválido'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const timelineStatuses = useMemo((): [
    ResetTimelineStepStatus,
    ResetTimelineStepStatus,
    ResetTimelineStepStatus,
    ResetTimelineStepStatus,
  ] => {
    if (successMsg) {
      return ['done', 'active', 'todo', 'todo'];
    }
    return ['active', 'todo', 'todo', 'todo'];
  }, [successMsg]);

  const onSubmit = async (data: FormValues) => {
    try {
      setErrorMsg('');
      setSuccessMsg('');
      const res = await api.post<{ message: string }>('/auth/forgot-password', { email: data.email });
      setSuccessMsg(res.data.message || 'Se existir uma conta com este e-mail, você receberá as instruções.');
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Não foi possível enviar o e-mail. Tente novamente.';
      setErrorMsg(msg);
    }
  };

  return (
    <div className="grid min-h-dvh overflow-x-hidden bg-slate-50 md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-center items-center p-12 bg-sidebar text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={`${import.meta.env.BASE_URL}images/doctor-abstract.png`} alt="Medical" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-md text-center">
          <Stethoscope className="w-16 h-16 mx-auto mb-8 text-primary" />
          <h2 className="text-4xl font-display font-bold mb-4 text-white">Redefinir sua senha</h2>
          <p className="text-lg text-white">
            Informe o e-mail da sua conta e enviaremos um link seguro para você criar uma nova senha.
          </p>
        </div>
      </div>

      <div className="flex min-w-0 items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md border-slate-200 shadow-xl">
          <CardHeader className="space-y-3 pt-6 text-center sm:pt-8">
            <div className="flex justify-center mb-5 md:hidden">
              <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="font-display text-2xl font-bold sm:text-3xl">Esqueci minha senha</CardTitle>
            <CardDescription>Digite o e-mail cadastrado no MedLearn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-5 border-b border-border/60 pb-5">
              <PasswordResetTimeline statuses={timelineStatuses} />
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {errorMsg && (
                <div className="p-4 text-sm text-red-600 bg-red-50 rounded-md border border-red-100">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-4 text-sm text-green-800 bg-green-50 rounded-md border border-green-100">
                  {successMsg}
                </div>
              )}
              <div className="space-y-2.5">
                <label className="text-sm font-medium">Email</label>
                <Input {...register('email')} placeholder="dr.nome@exemplo.com" className="sm:h-12" type="email" />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <Button type="submit" className="w-full text-base sm:h-12 sm:text-lg" isLoading={isSubmitting}>
                Enviar link por e-mail
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-7 pb-8 text-center">
            <p className="text-sm text-slate-600">
              <Link to="/login" className="text-primary hover:underline font-semibold">
                Voltar ao login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
