import { FileText } from 'lucide-react';
import { LegalDocumentModal } from '@/components/common/legal/LegalDocumentModal';
import { TermsOfUseContent } from '@/components/common/legal/TermsOfUseContent';
import { LEGAL_ENTITY, LEGAL_LAST_UPDATED } from '@/lib/legal-config';

interface TermsOfUseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermsOfUseModal({ open, onOpenChange }: TermsOfUseModalProps) {
  return (
    <LegalDocumentModal
      open={open}
      onOpenChange={onOpenChange}
      title="Termos de Uso"
      subtitle={LEGAL_ENTITY.platform}
      icon={FileText}
      footerNote={`Documento vigente em ${LEGAL_LAST_UPDATED}. Em caso de divergência com contratos específicos, prevalecem os instrumentos formalmente firmados com o usuário ou a instituição.`}
    >
      <TermsOfUseContent />
    </LegalDocumentModal>
  );
}
