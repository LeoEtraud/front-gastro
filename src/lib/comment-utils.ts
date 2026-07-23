import type { CommentRiskLevel, CommentStatus } from '@/types/api';

/** Limite de caracteres do comentário (espelha o padrão do backend). */
export const MAX_COMMENT_LENGTH = 1500;

/** Texto de orientação exibido acima do campo de comentário. */
export const COMMENT_GUIDANCE =
  'Compartilhe sua opinião sobre a aula de forma respeitosa. Não publique nomes, exames, prontuários, imagens ou outras informações que possam identificar pacientes.';

export function formatCommentDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function commentInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function statusLabel(status: CommentStatus): string {
  switch (status) {
    case 'pending_review':
      return 'Aguardando análise';
    case 'edit_requested':
      return 'Edição solicitada';
    case 'hidden':
      return 'Oculto';
    case 'removed':
      return 'Removido';
    default:
      return 'Publicado';
  }
}

export function riskLabel(risk: CommentRiskLevel): string {
  switch (risk) {
    case 'high':
      return 'Alto';
    case 'medium':
      return 'Médio';
    default:
      return 'Baixo';
  }
}
