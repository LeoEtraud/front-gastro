/**
 * Critérios de senha do fluxo de redefinição — espelha `back-med-learn/src/lib/password-reset-policy.ts`.
 */
export const RESET_PASSWORD_MIN_LENGTH = 8;

export type PasswordCriterionId = "length" | "upper" | "lower" | "digit" | "noSpace";

export type PasswordCriterion = {
  id: PasswordCriterionId;
  label: string;
  met: boolean;
};

export function getResetPasswordCriteria(password: string): PasswordCriterion[] {
  return [
    {
      id: "length",
      label: `Pelo menos ${RESET_PASSWORD_MIN_LENGTH} caracteres`,
      met: password.length >= RESET_PASSWORD_MIN_LENGTH,
    },
    { id: "upper", label: "Uma letra maiúscula (A–Z)", met: /[A-Z]/.test(password) },
    { id: "lower", label: "Uma letra minúscula (a–z)", met: /[a-z]/.test(password) },
    { id: "digit", label: "Um número (0–9)", met: /\d/.test(password) },
    { id: "noSpace", label: "Sem espaços em branco", met: !/\s/.test(password) },
  ];
}

export function resetPasswordMeetsAllCriteria(password: string): boolean {
  return getResetPasswordCriteria(password).every((c) => c.met);
}
