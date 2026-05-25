import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { RecaptchaWidget, getRecaptchaSiteKey } from '@/components/auth/RecaptchaWidget';
import { LegalDocumentLinks } from '@/components/common/LegalDocumentLinks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import '@/styles/animations/text-focus-in.css';

const THEME_KEY = 'medlearn_theme';

const loginFieldClass =
  'h-11 rounded-lg border-slate-200 sm:h-12 dark:h-11 dark:rounded-[10px] dark:border-slate-600 dark:bg-slate-700 dark:text-slate-50 dark:placeholder:text-slate-400 dark:focus-visible:border-sky-400 dark:focus-visible:ring-sky-400/40 sm:dark:h-12';

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

  /** Formulário de login sempre em tema claro para contraste legível (evita título branco em card branco). */
  useEffect(() => {
    const wasDark = document.documentElement.classList.contains('dark');
    document.documentElement.classList.remove('dark');
    return () => {
      if (wasDark || localStorage.getItem(THEME_KEY) === 'dark') {
        document.documentElement.classList.add('dark');
      }
    };
  }, []);

  useEffect(() => {
    const state = location.state as { registrationSuccess?: boolean } | null;
    if (state?.registrationSuccess) {
      toast({
        title: 'Cadastro realizado com sucesso!',
        description:
          'Após a confirmação do pagamento, o coordenador do curso irá habilitar seu acesso. Você receberá um e-mail para criar sua senha e acessar a plataforma.',
        duration: 12000,
      });
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
    <div className="grid min-h-dvh overflow-x-hidden bg-slate-50 dark:bg-slate-950 md:grid-cols-[minmax(0,55%)_minmax(0,45%)]">
      <div className="relative hidden overflow-hidden bg-sidebar text-white md:flex md:flex-col md:items-center md:justify-center md:p-12">
        <div className="absolute inset-0 opacity-30">
          <img
            src={`${import.meta.env.BASE_URL}img-de-fundo.jpg`}
            alt=""
            className="h-full w-full object-cover"
            aria-hidden
          />
        </div>
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sidebar/80 via-sidebar/50 to-gc-deep/70"
          aria-hidden
        />
        <div className="relative z-10 max-w-md px-4 text-center">
          <img
            src="/logo-menu-login.png"
            alt="GastroCentro"
            className="mx-auto mb-8 h-20 w-20 object-contain drop-shadow-md"
            width={100}
            height={100}
          />
          <h2 className="text-focus-in mb-4 font-display text-4xl font-bold text-white">
            Bem-vindo de volta ao GastroCentro
          </h2>
          <p className="text-lg leading-relaxed text-slate-300">
            Acesse seus cursos, continue seu aprendizado e expanda seus conhecimentos em saúde digestiva.
          </p>
        </div>
      </div>

      <div className="flex min-w-0 items-center justify-center p-4 sm:p-6">
        <div className="flex w-full max-w-md flex-col gap-4">
          <Card className="w-full border-slate-200 bg-white text-slate-900 shadow-xl">
            <CardHeader className="space-y-4 pt-6 text-center sm:space-y-5 sm:pt-8">
              <div className="flex justify-center pb-0.5">
                <div className="inline-flex max-w-[260px] rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/80">
                  <img
                    src="/logo-login.png"
                    alt="GastroCentro — Instituto de Ensino e Pesquisa"
                    className="h-auto w-full max-w-[220px] object-contain sm:max-w-[240px]"
                    width={300}
                    height={134}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <CardTitle className="!text-gc-text font-display text-2xl font-bold">
                  Entrar
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Acesse sua conta para continuar.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                {isPending && (
                  <div
                    role="status"
                    className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/35 dark:bg-amber-950/35 dark:text-amber-100"
                  >
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
                    <p>
                      Sua conta está <strong>aguardando habilitação</strong>. Após a confirmação do pagamento, o
                      coordenador irá liberar seu acesso e você receberá um e-mail para criar sua senha.
                    </p>
                  </div>
                )}
                {errorMsg && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500 dark:bg-red-950/30 dark:text-red-300"
                  >
                    {errorMsg}
                  </div>
                )}
                <div className="space-y-2.5">
                  <label htmlFor="login-email" className="text-sm font-medium text-slate-900">
                    E-mail
                  </label>
                  <Input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    placeholder="seu@email.com"
                    className={loginFieldClass}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'login-email-error' : undefined}
                  />
                  {errors.email && (
                    <p id="login-email-error" role="alert" className="text-xs text-red-500 dark:text-red-300">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2.5">
                  <label htmlFor="login-password" className="text-sm font-medium text-slate-900">
                    Senha
                  </label>
                  <PasswordInput
                    id="login-password"
                    autoComplete="current-password"
                    {...register('password')}
                    placeholder="••••••••"
                    className={loginFieldClass}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'login-password-error' : undefined}
                  />
                  {errors.password && (
                    <p id="login-password-error" role="alert" className="text-xs text-red-500 dark:text-red-300">
                      {errors.password.message}
                    </p>
                  )}
                  <div className="flex justify-end pt-2 pb-1">
                    <Link
                      to="/forgot-password"
                      className="min-h-11 inline-flex items-center text-sm font-medium text-primary hover:underline dark:text-sky-400 dark:hover:text-sky-300 sm:min-h-0"
                    >
                      Esqueci minha senha
                    </Link>
                  </div>
                </div>
                <div className="flex justify-center pt-0.5 pb-1">
                  <RecaptchaWidget
                    key={recaptchaMountKey}
                    onChange={setRecaptchaToken}
                    className="w-full max-w-[304px] scale-[0.98] sm:scale-100"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-11 w-full rounded-lg text-base shadow-sm focus-visible:ring-sky-400/35 dark:bg-sky-500 dark:text-white dark:hover:bg-sky-600 dark:focus-visible:ring-[3px] dark:focus-visible:ring-sky-400/35 sm:h-12 sm:text-lg"
                  isLoading={isSubmitting}
                  disabled={submitBlocked}
                >
                  {isSubmitting ? 'Acessando...' : 'Acessar plataforma'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-6 pb-6 text-center sm:pb-8">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Não tem uma conta?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-primary hover:underline dark:text-sky-400 dark:hover:text-sky-300"
                >
                  Cadastre-se
                </Link>
              </p>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Ao entrar, você concorda com os{' '}
                <LegalDocumentLinks
                  linkClassName="font-medium text-primary underline-offset-2 hover:underline dark:text-sky-400 dark:hover:text-sky-300"
                />
                .
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>

    </div>
  );
}
