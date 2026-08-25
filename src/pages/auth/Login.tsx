import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { RecaptchaWidget, getRecaptchaSiteKey } from '@/components/auth/RecaptchaWidget';
import { LegalDocumentLinks } from '@/components/common/LegalDocumentLinks';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

/* ── campo de input padrão das páginas de auth ── */
const authField =
  'h-12 rounded-[11px] border border-[#D8DEE8] bg-[#F7F9FC] px-4 text-[14.5px] text-gc-text placeholder:text-slate-400 shadow-none transition-[border-color,box-shadow] duration-150 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:bg-white focus-visible:ring-offset-0 aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus-visible:ring-red-300/30';

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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    const state = location.state as { registrationSuccess?: boolean } | null;
    if (state?.registrationSuccess) {
      toast({
        title: 'Cadastro realizado com sucesso!',
        description:
          'O coordenador do curso irá habilitar seu acesso. Você receberá um e-mail para criar sua senha (válido por 24 horas).',
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
    <AuthLayout
      heroBg={`${import.meta.env.BASE_URL}img-de-fundo.jpg`}
      heroTitle="Bem-vindo de volta à GastroCentro"
      heroSubtitle="Acesse seus cursos, continue seu aprendizado e expanda seus conhecimentos em saúde digestiva."
    >
      {/* ── Card ── */}
      <div className="w-full rounded-[22px] border border-[#E2E8F4] bg-white px-6 py-8 shadow-[0_8px_40px_rgba(7,27,53,0.09),0_1px_4px_rgba(7,27,53,0.05)] sm:px-8 sm:py-10">

        {/* Logo */}
        <div className="mb-7 flex justify-center">
          <img
            src="/logo-login.png"
            alt="GastroCentro — Instituto de Ensino e Pesquisa"
            className="h-auto w-full max-w-[180px] object-contain"
            width={280}
            height={125}
          />
        </div>

        {/* Heading */}
        <div className="mb-7 text-center">
          <h1 className="font-display text-[28px] font-bold tracking-tight text-gc-text">
            Entrar
          </h1>
          <p className="mt-1.5 text-[14.5px] leading-relaxed text-slate-500">
            Acesse sua conta para continuar seus estudos.
          </p>
        </div>

        {/* Banners de estado */}
        {isPending && (
          <div
            role="status"
            className="mb-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-800"
          >
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
            <p>
              Sua conta está <strong>aguardando habilitação</strong>. O coordenador irá liberar seu acesso.
            </p>
          </div>
        )}
        {errorMsg && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm text-red-600"
          >
            {errorMsg}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* E-mail */}
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="block text-[13px] font-semibold text-slate-700">
              E-mail
            </label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              {...register('email')}
              placeholder="seu@email.com"
              className={authField}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'login-email-error' : undefined}
            />
            {errors.email && (
              <p id="login-email-error" role="alert" className="text-[12px] text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Senha */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="block text-[13px] font-semibold text-slate-700">
                Senha
              </label>
              <Link
                to="/forgot-password"
                className="text-[12.5px] font-medium text-primary transition-colors hover:text-primary/80 hover:underline underline-offset-2"
              >
                Esqueci minha senha
              </Link>
            </div>
            <PasswordInput
              id="login-password"
              autoComplete="current-password"
              {...register('password')}
              placeholder="••••••••"
              className={authField}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
            />
            {errors.password && (
              <p id="login-password-error" role="alert" className="text-[12px] text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* reCAPTCHA */}
          <div className="flex justify-center py-1">
            <RecaptchaWidget
              key={recaptchaMountKey}
              onChange={setRecaptchaToken}
              className="w-full max-w-[304px]"
            />
          </div>

          {/* Botão principal */}
          <Button
            type="submit"
            className="h-12 w-full rounded-[11px] text-[15px] font-semibold tracking-wide shadow-[0_2px_10px_rgba(30,144,232,0.22)] transition-all duration-200 hover:brightness-[1.06] hover:shadow-[0_4px_16px_rgba(30,144,232,0.30)] active:scale-[0.99] disabled:brightness-90 disabled:shadow-none"
            isLoading={isSubmitting}
            disabled={submitBlocked}
          >
            {isSubmitting ? 'Acessando...' : 'Acessar plataforma'}
          </Button>
        </form>

        {/* Rodapé do card */}
        <div className="mt-7 space-y-3 border-t border-slate-100 pt-6 text-center">
          <p className="text-[13.5px] text-slate-600">
            Não tem uma conta?{' '}
            <Link
              to="/register"
              className="font-semibold text-primary transition-colors hover:text-primary/80 hover:underline underline-offset-2"
            >
              Cadastre-se
            </Link>
          </p>
          <p className="text-[12px] leading-relaxed text-slate-400">
            Conta habilitada e o link de senha expirou? Use{' '}
            <Link
              to="/forgot-password"
              className="font-medium text-slate-500 underline-offset-2 transition-colors hover:text-primary hover:underline"
            >
              Esqueci minha senha
            </Link>
            .
          </p>
          <p className="text-[12px] leading-relaxed text-slate-400">
            Ao entrar, você concorda com os{' '}
            <LegalDocumentLinks
              linkClassName="font-medium text-slate-500 underline-offset-2 hover:underline transition-colors hover:text-primary"
            />
            .
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
