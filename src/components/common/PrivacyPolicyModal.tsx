import { Shield } from 'lucide-react';
import { LegalDocumentModal } from '@/components/common/legal/LegalDocumentModal';
import { PrivacyPolicyContent } from '@/components/common/legal/PrivacyPolicyContent';
import { LEGAL_ENTITY, LEGAL_LAST_UPDATED } from '@/lib/legal-config';

interface PrivacyPolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivacyPolicyModal({ open, onOpenChange }: PrivacyPolicyModalProps) {
  return (
    <LegalDocumentModal
      open={open}
      onOpenChange={onOpenChange}
      title="Política de Privacidade"
      subtitle={`${LEGAL_ENTITY.platform} · LGPD (Lei nº 13.709/2018) · atualizado em ${LEGAL_LAST_UPDATED}`}
      icon={Shield}
      footerNote={`Documento vigente em ${LEGAL_LAST_UPDATED}. Para exercer direitos previstos na LGPD, utilize o canal de privacidade indicado no documento.`}
    >
      <PrivacyPolicyContent />
    </LegalDocumentModal>
  );
}
