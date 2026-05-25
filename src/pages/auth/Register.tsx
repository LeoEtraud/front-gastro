import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CPF_MASK_MAX_LENGTH,
  PHONE_BR_MASK_MAX_LENGTH,
  digitsOnly,
  formatCpf,
  formatPhoneBR,
  isValidCpf,
  isValidPhoneBR,
} from '@/lib/profile-formatters';
import { RecaptchaWidget, getRecaptchaSiteKey } from '@/components/auth/RecaptchaWidget';
import { AuthLayout } from '@/components/auth/AuthLayout';

/* ── campo de input padrão das páginas de auth ── */
const authField =
  'h-12 rounded-[11px] border border-[#D8DEE8] bg-[#F7F9FC] px-4 text-[14.5px] text-gc-text placeholder:text-slate-400 shadow-none transition-[border-color,box-shadow] duration-150 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 focus-visible:bg-white focus-visible:ring-offset-0 aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus-visible:ring-red-300/30';

const selectField =
  'flex h-12 w-full rounded-[11px] border border-[#D8DEE8] bg-[#F7F9FC] px-4 text-[14.5px] text-gc-text shadow-none transition-[border-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/15 focus:border-primary focus:bg-white touch-manipulation appearance-none cursor-pointer';

const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  cpf: z
    .string()
    .min(1, 'CPF é obrigatório')
    .max(CPF_MASK_MAX_LENGTH, `CPF pode ter no máximo ${CPF_MASK_MAX_LENGTH} caracteres`)
    .refine((v) => isValidCpf(v, { allowEmpty: false }), 'CPF inválido')
    .transform(digitsOnly),
  phone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .max(PHONE_BR_MASK_MAX_LENGTH, `Telefone pode ter no máximo ${PHONE_BR_MASK_MAX_LENGTH} caracteres`)
    .refine(
      (v) => isValidPhoneBR(v, { allowEmpty: false }),
      'Informe um telefone válido com DDD (mesmo formato do perfil).',
    )
    .transform(digitsOnly),
  role: z.enum(['STUDENT', 'TEACHER']),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaMountKey, setRecaptchaMountKey] = useState(0);
  const hasRecaptchaSiteKey = Boolean(getRecaptchaSiteKey());

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: { role: 'STUDENT', name: '', email: '', cpf: '', phone: '' },
  });

  const cpfRegister = register('cpf', { maxLength: CPF_MASK_MAX_LENGTH });
  const phoneRegister = register('phone', { maxLength: PHONE_BR_MASK_MAX_LENGTH });

  const onSubmit = async (data: RegisterForm) => {
    if (!hasRecaptchaSiteKey) {
      setErrorMsg('reCAPTCHA não está configurado neste ambiente.');
      return;
    }
    if (!recaptchaToken) {
      setErrorMsg('Marque a caixa do reCAPTCHA antes de enviar.');
      return;
    }
    try {
      setErrorMsg('');
      await registerUser.mutateAsync({
        name: data.name,
        email: data.email,
        role: data.role,
        cpf: data.cpf,
        phone: data.phone,
        recaptchaToken,
      });
      navigate('/login', { replace: true, state: { registrationSuccess: true } });
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Erro ao criar conta.';
      setErrorMsg(msg);
      setRecaptchaToken(null);
      setRecaptchaMountKey((k) => k + 1);
    }
  };

  const submitBlocked = !isValid || !recaptchaToken || !hasRecaptchaSiteKey;

  return (
    <AuthLayout
      heroBg={`${import.meta.env.BASE_URL}img-de-fundo-2.jpg`}
      heroTitle="Comece sua jornada no GastroCentro"
      heroSubtitle="Crie sua conta e acesse cursos, materiais e uma comunidade focada em educação médica de qualidade."
      formMaxWidth="max-w-[480px]"
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
            Criar conta
          </h1>
          <p className="mx-auto mt-1.5 max-w-[340px] text-[14px] leading-relaxed text-slate-500">
            Junte-se à plataforma. Após o cadastro, enviaremos um e-mail para você definir sua senha
            de acesso.
          </p>
        </div>

        {/* Erro */}
        {errorMsg && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm text-red-600"
          >
            {errorMsg}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

          {/* Nome */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-semibold text-slate-700">Nome completo</label>
            <Input
              {...register('name')}
              placeholder="Ana Silva Souza"
              className={authField}
              autoComplete="name"
            />
            {errors.name && <p className="text-[12px] text-red-500">{errors.name.message}</p>}
          </div>

          {/* E-mail */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-semibold text-slate-700">E-mail</label>
            <Input
              type="email"
              {...register('email')}
              placeholder="dr.nome@exemplo.com"
              className={authField}
              autoComplete="email"
            />
            {errors.email && <p className="text-[12px] text-red-500">{errors.email.message}</p>}
          </div>

          {/* CPF e Telefone em grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-slate-700">CPF</label>
              <Input
                {...cpfRegister}
                placeholder="000.000.000-00"
                className={authField}
                inputMode="numeric"
                autoComplete="off"
                title="Mesma máscara do perfil: até 11 dígitos (000.000.000-00)"
                onChange={(e) => {
                  e.target.value = formatCpf(e.target.value);
                  cpfRegister.onChange(e);
                }}
              />
              {errors.cpf && <p className="text-[12px] text-red-500">{errors.cpf.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[13px] font-semibold text-slate-700">Telefone</label>
              <Input
                {...phoneRegister}
                placeholder="(98) 99999-9999"
                className={authField}
                inputMode="tel"
                autoComplete="tel"
                title="Mesma máscara do perfil: (DD) número com hífen"
                onChange={(e) => {
                  e.target.value = formatPhoneBR(e.target.value);
                  phoneRegister.onChange(e);
                }}
              />
              {errors.phone && <p className="text-[12px] text-red-500">{errors.phone.message}</p>}
            </div>
          </div>

          {/* Perfil */}
          <div className="space-y-1.5">
            <label className="block text-[13px] font-semibold text-slate-700">Perfil</label>
            <div className="relative">
              <select {...register('role')} className={selectField}>
                <option value="STUDENT">Estudante</option>
                <option value="TEACHER">Professor</option>
              </select>
              {/* Ícone chevron */}
              <svg
                aria-hidden
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
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
            Cadastrar na plataforma
          </Button>
        </form>

        {/* Rodapé */}
        <div className="mt-6 border-t border-slate-100 pt-5 text-center">
          <p className="text-[13.5px] text-slate-600">
            Já tem uma conta?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary transition-colors hover:text-primary/80 hover:underline underline-offset-2"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
