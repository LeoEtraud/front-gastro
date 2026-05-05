import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Stethoscope } from 'lucide-react';
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
    .refine((v) => isValidPhoneBR(v, { allowEmpty: false }), 'Informe um telefone válido com DDD (mesmo formato do perfil).')
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
      navigate('/login', {
        replace: true,
        state: { registrationSuccess: true },
      });
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao criar conta.';
      setErrorMsg(msg);
      setRecaptchaToken(null);
      setRecaptchaMountKey((k) => k + 1);
    }
  };

  const submitBlocked = !isValid || !recaptchaToken || !hasRecaptchaSiteKey;

  return (
    <div className="grid min-h-dvh overflow-x-hidden bg-slate-50 md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-center items-center p-12 bg-sidebar text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={`${import.meta.env.BASE_URL}images/doctor-abstract.png`} alt="Medical" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-md text-center">
          <Stethoscope className="w-16 h-16 mx-auto mb-8 text-primary" />
          <h2 className="text-4xl font-display font-bold mb-4 text-white">Comece sua jornada no MedLearn</h2>
          <p className="text-lg text-slate-300">
            Crie sua conta e acesse cursos, materiais e uma comunidade focada em educação médica de qualidade.
          </p>
        </div>
      </div>

      <div className="flex min-w-0 items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md border-slate-200 shadow-xl">
          <CardHeader className="space-y-2 pt-6 text-center sm:pt-8">
            <div className="flex justify-center mb-4 md:hidden">
              <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="font-display text-2xl font-bold sm:text-3xl">Criar conta</CardTitle>
            <CardDescription>
              Junte-se à plataforma de educação médica. Após o cadastro, enviaremos um e-mail para você definir sua
              senha de acesso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {errorMsg && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100">
                  {errorMsg}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome completo</label>
                <Input {...register('name')} placeholder="Dra. Ana Silva" className="sm:h-12" autoComplete="name" />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" {...register('email')} placeholder="dr.nome@exemplo.com" className="sm:h-12" autoComplete="email" />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">CPF</label>
                <Input
                  {...cpfRegister}
                  placeholder="000.000.000-00"
                  className="sm:h-12"
                  inputMode="numeric"
                  autoComplete="off"
                  title="Mesma máscara do perfil: até 11 dígitos (000.000.000-00)"
                  onChange={(e) => {
                    e.target.value = formatCpf(e.target.value);
                    cpfRegister.onChange(e);
                  }}
                />
                {errors.cpf && <p className="text-xs text-red-500">{errors.cpf.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefone</label>
                <Input
                  {...phoneRegister}
                  placeholder="(98) 99999-9999"
                  className="sm:h-12"
                  inputMode="tel"
                  autoComplete="tel"
                  title="Mesma máscara do perfil: (DD) número com hífen"
                  onChange={(e) => {
                    e.target.value = formatPhoneBR(e.target.value);
                    phoneRegister.onChange(e);
                  }}
                />
                {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
              </div>
              <div className="space-y-2 pb-2">
                <label className="text-sm font-medium">Eu sou um...</label>
                <select
                  {...register('role')}
                  className="flex h-11 min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-12 sm:text-sm touch-manipulation"
                >
                  <option value="STUDENT">Estudante</option>
                  <option value="TEACHER">Professor / Coordenador</option>
                </select>
              </div>
              <div className="space-y-2">
                <RecaptchaWidget key={recaptchaMountKey} onChange={setRecaptchaToken} />
              </div>
              <Button
                type="submit"
                className="w-full text-base sm:h-12 sm:text-lg"
                isLoading={isSubmitting}
                disabled={submitBlocked}
              >
                Cadastrar na plataforma
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 pb-8 text-center">
            <p className="text-sm text-slate-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary hover:underline font-semibold">
                Entrar
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
