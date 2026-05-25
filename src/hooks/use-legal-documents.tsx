import { useCallback, useState } from 'react';
import { PrivacyPolicyModal } from '@/components/common/PrivacyPolicyModal';
import { TermsOfUseModal } from '@/components/common/TermsOfUseModal';

export function useLegalDocuments() {
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const openTerms = useCallback(() => setTermsOpen(true), []);
  const openPrivacy = useCallback(() => setPrivacyOpen(true), []);

  const modals = (
    <>
      <TermsOfUseModal open={termsOpen} onOpenChange={setTermsOpen} />
      <PrivacyPolicyModal open={privacyOpen} onOpenChange={setPrivacyOpen} />
    </>
  );

  return {
    termsOpen,
    setTermsOpen,
    privacyOpen,
    setPrivacyOpen,
    openTerms,
    openPrivacy,
    modals,
  };
}
