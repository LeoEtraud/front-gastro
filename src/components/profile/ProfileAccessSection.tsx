import type { FormEvent } from "react";
import { Save } from "lucide-react";
import { AvatarUploadField } from "@/components/profile/AvatarUploadField";
import { SpecialtyCombobox } from "@/components/profile/SpecialtyCombobox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type ProfileFormValues = {
  name: string;
  phone: string;
  cpf: string;
  specialty: string;
  bio: string;
  avatarUrl: string;
};

type ProfileFormErrors = Partial<Record<"name" | "phone" | "cpf" | "specialty", string>>;

interface ProfileAccessSectionProps {
  values: ProfileFormValues;
  email: string;
  displayName: string;
  errors: ProfileFormErrors;
  legacySpecialty?: string | null;
  isSaving: boolean;
  onSubmit: (e: FormEvent) => void;
  onValueChange: <K extends keyof ProfileFormValues>(field: K, value: ProfileFormValues[K]) => void;
}

export function ProfileAccessSection({
  values,
  email,
  displayName,
  errors,
  legacySpecialty,
  isSaving,
  onSubmit,
  onValueChange,
}: ProfileAccessSectionProps) {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardTitle>Perfil de acesso</CardTitle>
        <p className="text-sm text-muted-foreground">
          Mantenha seus dados atualizados para facilitar a identificação dentro da plataforma.
        </p>
        <Separator />
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="order-2 space-y-4 lg:order-1">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="profile-name" className="text-sm font-medium">
                    Nome completo
                  </label>
                  <Input
                    id="profile-name"
                    value={values.name}
                    onChange={(e) => onValueChange("name", e.target.value)}
                    aria-invalid={Boolean(errors.name)}
                    className="bg-background"
                  />
                  {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
                </div>
                <div className="space-y-2">
                  <label htmlFor="profile-email" className="text-sm font-medium">
                    E-mail
                  </label>
                  <Input id="profile-email" value={email} disabled className="bg-background text-foreground disabled:opacity-100" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="profile-phone" className="text-sm font-medium">
                    Telefone (opcional)
                  </label>
                  <Input
                    id="profile-phone"
                    value={values.phone}
                    onChange={(e) => onValueChange("phone", e.target.value)}
                    inputMode="numeric"
                    placeholder="(11) 99999-9999"
                    aria-invalid={Boolean(errors.phone)}
                    className="bg-background"
                  />
                  {errors.phone ? <p className="text-xs text-destructive">{errors.phone}</p> : null}
                </div>
                <div className="space-y-2">
                  <label htmlFor="profile-cpf" className="text-sm font-medium">
                    CPF
                  </label>
                  <Input
                    id="profile-cpf"
                    value={values.cpf}
                    onChange={(e) => onValueChange("cpf", e.target.value)}
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    aria-invalid={Boolean(errors.cpf)}
                    className="bg-background"
                  />
                  {errors.cpf ? <p className="text-xs text-destructive">{errors.cpf}</p> : null}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="profile-specialty" className="text-sm font-medium">
                  Especialidade
                </label>
                <SpecialtyCombobox
                  id="profile-specialty"
                  value={values.specialty}
                  onValueChange={(next) => onValueChange("specialty", next)}
                  disabled={isSaving}
                />
                {legacySpecialty ? (
                  <p className="text-xs text-muted-foreground">
                    Especialidade atual "{legacySpecialty}" não está na lista oficial. Selecione uma opção para atualizar.
                  </p>
                ) : null}
                {errors.specialty ? <p className="text-xs text-destructive">{errors.specialty}</p> : null}
              </div>

              <div className="space-y-2">
                <label htmlFor="profile-bio" className="text-sm font-medium">
                  Biografia profissional
                </label>
                <Textarea
                  id="profile-bio"
                  value={values.bio}
                  onChange={(e) => onValueChange("bio", e.target.value)}
                  className="min-h-28 resize-y bg-background"
                  placeholder="Descreva sua atuação, experiência e objetivos."
                  maxLength={600}
                />
                <p className="text-xs text-muted-foreground">{values.bio.length}/600 caracteres</p>
              </div>
            </div>

            <Card className="order-1 h-fit lg:order-2">
              <CardContent className="space-y-2 pt-6">
                <p className="text-sm font-medium">Foto de perfil</p>
                <AvatarUploadField
                  displayName={displayName}
                  avatarUrl={values.avatarUrl}
                  onAvatarUrlChange={(next) => onValueChange("avatarUrl", next)}
                  disabled={isSaving}
                />
              </CardContent>
            </Card>
          </div>

          <Button type="submit" isLoading={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            Salvar dados
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
