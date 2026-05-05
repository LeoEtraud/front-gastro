import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { RecaptchaWidget, getRecaptchaSiteKey } from '@/components/auth/RecaptchaWidget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Stethoscope, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [errorMsg, setErrorMsg] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaMountKey, setRecaptchaMountKey] = useState(0);

  const hasRecaptchaSiteKey = Boolean(getRecaptchaSiteKey());

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    const state = location.state as { registrationSuccess?: boolean } | null;
    if (state?.registrationSuccess) {
      toast({
        title: 'Cadastro realizado com sucesso!',
        description:
          'Após a confirmação do pagamento, o coordenador do curso irá habilitar seu acesso. Você receberá um e-mail para criar sua senha e acessar a plataforma.',
        duration: 12000,
      });
      // limpa o estado para não reexibir ao recarregar
      window.history.replaceState({}, '');
    }
  }, []);

  const onSubmit = async (data: LoginForm) => {
    if (!hasRecaptchaSiteKey) {
      setErrorMsg('reCAPTCHA não está configurado neste ambiente.');
      return;
    }
    if (!recaptchaToken) {
      setErrorMsg('Marque a caixa do reCAPTCHA antes de entrar.');
      return;
    }

    try {
      setErrorMsg('');
      setIsPending(false);
      await login.mutateAsync({ ...data, recaptchaToken });
    } catch (error: unknown) {
      const response = (error as { response?: { data?: { error?: string; code?: string } } })?.response;
      if (response?.data?.code === 'ACCOUNT_PENDING') {
        setIsPending(true);
        setErrorMsg('');
      } else {
        setIsPending(false);
        setErrorMsg(response?.data?.error || 'Erro ao fazer login. Verifique suas credenciais.');
      }
      setRecaptchaToken(null);
      setRecaptchaMountKey((k) => k + 1);
    }
  };

  const submitBlocked = !recaptchaToken || !hasRecaptchaSiteKey;

  return (
    <div className="grid min-h-dvh overflow-x-hidden bg-slate-50 md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-center items-center p-12 bg-sidebar text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={`${import.meta.env.BASE_URL}images/doctor-abstract.png`} alt="Medical" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-md text-center">
          <Stethoscope className="w-16 h-16 mx-auto mb-8 text-primary" />
          <h2 className="mb-4 font-display text-4xl font-bold text-white">
            Bem-vindo de volta ao MedLearn
          </h2>
          <p className="text-lg text-slate-300">Acesse seus cursos, continue seu aprendizado e expanda seus conhecimentos médicos.</p>
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
            <CardTitle className="font-display text-2xl font-bold sm:text-3xl">Entrar</CardTitle>
            <CardDescription>Insira suas credenciais para acessar a plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {isPending && (
                <div className="flex gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <p>
                    Sua conta está <strong>aguardando habilitação</strong>. Após a confirmação do pagamento, o
                    coordenador irá liberar seu acesso e você receberá um e-mail para criar sua senha.
                  </p>
                </div>
              )}
              {errorMsg && (
                <div className="p-4 text-sm text-red-600 bg-red-50 rounded-md border border-red-100">
                  {errorMsg}
                </div>
              )}
              <div className="space-y-2.5">
                <label className="text-sm font-medium">Email</label>
                <Input {...register('email')} placeholder="dr.nome@exemplo.com" className="sm:h-12" />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div className="space-y-2.5">
                <label className="text-sm font-medium">Senha</label>
                <PasswordInput {...register('password')} placeholder="••••••••" className="sm:h-12" />
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                <div className="flex justify-end pt-1.5">
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline font-medium">
                    Esqueci minha senha
                  </Link>
                </div>
              </div>
              <div className="pt-1">
                <RecaptchaWidget key={recaptchaMountKey} onChange={setRecaptchaToken} />
              </div>
              <Button
                type="submit"
                className="w-full text-base sm:h-12 sm:text-lg"
                isLoading={isSubmitting}
                disabled={submitBlocked}
              >
                Entrar na Plataforma
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-7 pb-8 text-center">
            <p className="text-sm text-slate-600">
              Não tem uma conta? <Link to="/register" className="text-primary hover:underline font-semibold">Cadastre-se</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
