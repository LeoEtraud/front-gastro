import { useEffect, useState } from 'react';
import { KeyRound } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import { CompactContentSkeleton, ProfileSkeleton } from '@/components/ui/content-skeletons';
import { ProfileAccessSection } from '@/components/profile/ProfileAccessSection';
import { useToast } from '@/hooks/use-toast';
import {
  useTeacherProfile,
  useUpdateTeacherPassword,
  useUpdateTeacherProfile,
} from '@/hooks/use-teacher';
import { formatCpf, formatPhoneBR, isValidCpf, isValidPhoneBR } from '@/lib/profile-formatters';
import { MEDICAL_SPECIALTIES } from '@/lib/medical-specialties';
import { roleLabel } from '@/lib/permissions';
import { useDelayedFlag } from '@/hooks/use-delayed-flag';

export default function TeacherProfile() {
  const { toast } = useToast();
  const { data: profile, isLoading } = useTeacherProfile();
  const showLoading = useDelayedFlag(isLoading);
  const updateProfile = useUpdateTeacherProfile();
  const updatePassword = useUpdateTeacherPassword();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [legacySpecialty, setLegacySpecialty] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<Record<'name' | 'phone' | 'cpf' | 'specialty', string>>>({});

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!profile) return;
    const normalizedSpecialty = profile.specialty?.trim() ?? '';
    const hasKnownSpecialty = normalizedSpecialty && MEDICAL_SPECIALTIES.includes(normalizedSpecialty as (typeof MEDICAL_SPECIALTIES)[number]);
    setName(profile.name ?? '');
    setBio(profile.bio ?? '');
    setSpecialty(hasKnownSpecialty ? normalizedSpecialty : '');
    setLegacySpecialty(!hasKnownSpecialty && normalizedSpecialty ? normalizedSpecialty : null);
    setPhone(formatPhoneBR(profile.phone ?? ''));
    setCpf(formatCpf(profile.cpf ?? ''));
    setAvatarUrl(profile.avatarUrl ?? '');
  }, [profile]);

  const onProfileValueChange = (field: 'name' | 'bio' | 'specialty' | 'phone' | 'cpf' | 'avatarUrl', value: string) => {
    if (field === 'phone') {
      setPhone(formatPhoneBR(value));
    } else if (field === 'cpf') {
      setCpf(formatCpf(value));
    } else if (field === 'name') {
      setName(value);
    } else if (field === 'bio') {
      setBio(value);
    } else if (field === 'specialty') {
      setSpecialty(value);
      setLegacySpecialty(null);
    } else {
      setAvatarUrl(value);
    }
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const onSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Partial<Record<'name' | 'phone' | 'cpf' | 'specialty', string>> = {};
    if (!name.trim()) nextErrors.name = 'Nome completo é obrigatório.';
    if (!isValidPhoneBR(phone)) nextErrors.phone = 'Informe um telefone válido com DDD.';
    if (!isValidCpf(cpf)) nextErrors.cpf = 'CPF inválido.';
    if (specialty && !MEDICAL_SPECIALTIES.includes(specialty as (typeof MEDICAL_SPECIALTIES)[number])) {
      nextErrors.specialty = 'Selecione uma especialidade válida na lista.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      toast({ variant: 'destructive', title: 'Revise os campos destacados.' });
      return;
    }

    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        bio: bio.trim() || '',
        specialty: specialty || '',
        phone: phone.trim() || '',
        cpf: cpf.trim() || '',
        avatarUrl: avatarUrl || '',
      });
      setLegacySpecialty(null);
      toast({ variant: 'success', title: 'Perfil atualizado com sucesso' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar perfil',
        description: error?.response?.data?.error ?? 'Tente novamente.',
      });
    }
  };

  const onUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ variant: 'destructive', title: 'Preencha todos os campos de senha' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ variant: 'destructive', title: 'A nova senha deve ter no mínimo 6 caracteres' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: 'destructive', title: 'A confirmação de senha não confere' });
      return;
    }

    try {
      await updatePassword.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({ variant: 'success', title: 'Senha alterada com sucesso' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao alterar senha',
        description: error?.response?.data?.error ?? 'Tente novamente.',
      });
    }
  };

  if (isLoading && !profile) {
    if (!showLoading) {
      return (
        <AppLayout>
          <div className="mx-auto max-w-[92rem] min-w-0">
            <CompactContentSkeleton />
          </div>
        </AppLayout>
      );
    }
    return <AppLayout><ProfileSkeleton /></AppLayout>;
  }
  if (!profile) return <AppLayout><div>Não foi possível carregar o perfil.</div></AppLayout>;

  return (
    <AppLayout>
      <div className="mx-auto max-w-[92rem] min-w-0 space-y-6">
        <div className="flex flex-col gap-2">
          <p className="mb-1 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {roleLabel(profile.role)}
          </p>
          <div className="inline-flex w-fit flex-col gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Meu Perfil</h1>
            <div className="h-1 w-full rounded-full bg-primary/80" />
          </div>
        </div>

        <ProfileAccessSection
          values={{ name, bio, specialty, phone, cpf, avatarUrl }}
          email={profile.email}
          displayName={name || profile.name}
          errors={formErrors}
          legacySpecialty={legacySpecialty}
          isSaving={updateProfile.isPending}
          onSubmit={onSaveProfile}
          onValueChange={onProfileValueChange}
        />

        <Card>
          <CardHeader>
            <CardTitle>Segurança</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onUpdatePassword} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Senha atual</label>
                  <PasswordInput value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nova senha</label>
                  <PasswordInput value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirmar nova senha</label>
                  <PasswordInput value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
              </div>

              <Button
                type="submit"
                isLoading={updatePassword.isPending}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                <KeyRound className="mr-2 h-4 w-4" />
                Alterar senha
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
