/** Atualize estes valores quando publicar nova versão dos documentos legais. */
export const LEGAL_LAST_UPDATED = '7 de julho de 2026';

/** Canal único para suporte, privacidade, DPO e demais assuntos. */
export const LEGAL_CONTACT_EMAIL = 'noreply@institutogastrocentro.com.br';

export const LEGAL_SUPPORT_EMAIL = LEGAL_CONTACT_EMAIL;
export const LEGAL_PRIVACY_EMAIL = LEGAL_CONTACT_EMAIL;

/** Nome do encarregado (DPO), se designado; deixe vazio para omitir na exibição. */
export const LEGAL_DPO_NAME = '';

export const LEGAL_ENTITY = {
  name: 'GastroCentro',
  platform: 'Instituto GastroCentro',
  cnpj: '62.745.552/0001-86',
  address:
    'Medical Jaracaty, Sala 913, Av. Prof. Carlos Cunha, nº 1 – Jaracaty, São Luís – MA',
} as const;
