import { cn } from '@/lib/utils';
import { useLegalDocuments } from '@/hooks/use-legal-documents';

type LegalDocumentLinksProps = {
  className?: string;
  linkClassName?: string;
  separator?: string;
};

export function LegalDocumentLinks({
  className,
  linkClassName = 'font-medium text-primary underline-offset-2 hover:underline',
  separator = ' e ',
}: LegalDocumentLinksProps) {
  const { openTerms, openPrivacy, modals } = useLegalDocuments();

  const linkBtn = cn(
    'cursor-pointer border-0 bg-transparent p-0 text-inherit underline-offset-2 hover:underline',
    linkClassName,
  );

  return (
    <>
      <span className={className}>
        <button type="button" onClick={openTerms} className={linkBtn}>
          Termos de Uso
        </button>
        {separator}
        <button type="button" onClick={openPrivacy} className={linkBtn}>
          Política de Privacidade
        </button>
      </span>
      {modals}
    </>
  );
}
